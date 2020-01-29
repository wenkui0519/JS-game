function Mine(tr,td,mineNum){//构造函数 三个参数由用户控制的三个值
    this.tr = tr;
    this.td = td;
    this.mineNum = mineNum; //雷的数量

    this.squares = [];//存储方块的信息，是一个二维数组，存取都使用行列的形式
    this.tds = [];    //存储所有的单元格的DOM  也是一个二维数组
    this.surplusMine = mineNum; //剩余雷的数量
    this.allRight = false;      //右击小红旗所标记的是否是雷，判断游戏是否会成功

    this.parent = document.querySelector(".gameBox");
}
//生成n个不重复的数子
Mine.prototype.randomNum = function(){
    var square = new Array(this.tr*this.td);//生成一个空数组，但是有长度，长度为格子的总数
    for(var i = 0;i<square.length;i++){
        square[i]=i;
    }
    square.sort(function(){return Math.random()-0.5;});
    return square.slice(0,this.mineNum);
}
Mine.prototype.init = function(){  
    var rn = this.randomNum();//雷在格子里的位置
    var n = 0;  //用来找到格子对应的索引
    // console.log(this.randomNum());
    for(var i=0;i<this.tr;i++){
		this.squares[i]=[];
		for(var j=0;j<this.td;j++){
			//this.squares[i][j]=;
			//n++;

			//取一个方块在数组里的数据要使用行与列的形式去取。找方块周围的方块的时候要用坐标的形式去取。行与列的形式跟坐标的形式x,y是刚好相反的
			if(rn.indexOf(++n)!=-1){
				//如果这个条件成立，说明现在循环到的这个索引在雷的数组里找到了，那就表示这个索引对应的是个雷
				this.squares[i][j]={type:'mine',x:j,y:i};
			}else{
				this.squares[i][j]={type:'number',x:j,y:i,value:0};
			}
		}
    }
    this.parent.oncontextmenu=function(){
		return false;
	}
    console.log(this.squares);
    this.updateNum();
    this.createDom(); 

    //剩余雷数
	this.mineNumDom=document.querySelector('.mineNum');
	this.mineNumDom.innerHTML=this.surplusMine;
};

//创建表格
Mine.prototype.createDom = function(){
    var This = this;
    var table = document.createElement("table");

    for(var i=0;i<this.tr;i++){	//行
		var domTr=document.createElement('tr');
		this.tds[i]=[];

		for(var j=0;j<this.td;j++){	//列
			var domTd=document.createElement('td');
			// domTd.innerHTML=0;

			domTd.pos=[i,j];	//把格子对应的行与列存到格子身上，为了下面通过这个值去数组里取到对应的数据

			this.tds[i][j]=domTd;	//这里是把所有创建的td添加到数组当中 

			// if(this.squares[i][j].type=='mine'){
			// 	domTd.className='mine';
            // }
            // if(this.squares[i][j].type=='number'){
            //     domTd.innerHTML = this.squares[i][j].value;
            // }
            domTr.appendChild(domTd);
            domTd.onmousedown = function(){
                This.play(event,this);//This指向实例对象 this指向domTd
            }
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML="";
    this.parent.appendChild(table);
};


//找某个方格周围的8个方格
Mine.prototype.getAround = function(square){
    var x = square.x;
    var y = square.y;
    var result = []; //把找到的格子的坐标返回出去，二维数组
    for(var i=x-1;i<=x+1;i++){
		for(var j=y-1;j<=y+1;j++){
            if(
                i<0||j<0||i>this.td-1||j>this.tr-1||//四周
                (i==x&&j==y) ||//找到自身
                this.squares[j][i].type=='mine'//雷
            ){
                continue;
            }
            result.push([j,i]);	//要以行与列的形式返回出去。因为到时候需要用它去取数组里的数据
        }
    }
    return result;
};

//更新所有的数字
Mine.prototype.updateNum = function(){
    for(var i=0;i<this.tr;i++){
		for(var j=0;j<this.td;j++){
            if(this.squares[i][j].type == 'number'){
                continue
            }
            var num = this.getAround(this.squares[i][j]);
            for(var k = 0;k<num.length;k++){
                this.squares[num[k][0]][num[k][1]].value+=1;
            }
        }
    }
}
Mine.prototype.play=function(ev,obj){
    var This = this;
    //左键
    if(ev.which==1 && obj.className!='flag'){
        // console.log(obj);
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
		var cl=['zero','one','two','three','four','five','six','seven','eigth'];

        if(curSquare.type=='number'){
            //数字
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value];
            if(curSquare.value==0){
                obj.innerHTML='';
                function getAllZero(square){
                    var around = This.getAround(square)
                    for(var k=0;k<around.length;k++){
                        var x =around[k][0],
                            y =around[k][1];
                        This.tds[x][y].className = cl[This.squares[x][y].value];
                        if(This.squares[x][y].value==0){
                            if(!This.tds[x][y].check){
                                This.tds[x][y].check=true;
                                getAllZero(This.squares[x][y]);
                            }
                        }else{
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        }
                    }
                }
                getAllZero(curSquare);
            }
        }else{
            //雷
            console.log("点到雷了")
            this.gameOver(obj);
        }
    }
    //右键
    else if(ev.which==3){
        /*
            1、如果是数字，就不能点
            2、切换class flag
            3、判断后期背后是不是全是雷
            4、判断最下边雷的个数
            5、判断输赢
        */
       if(obj.className && obj.className!='flag'){
           return
       }
       obj.className= obj.className=='flag'?'':'flag';

       if(this.squares[obj.pos[0]][obj.pos[1]].type=='mine'){
            this.allRight = true;
       }else{
        this.allRight = false;
       }

       if(obj.className=='flag'){
        this.mineNumDom.innerHTML=--this.surplusMine;
       }else{
        this.mineNumDom.innerHTML=++this.surplusMine;
       }

       if(this.surplusMine==0){
        //剩余的雷的数量为0，表示用户已经标完小红旗了，这时候要判断游戏是成功还是结束
            if(this.allRight){
                //这个条件成立说明用户全部标对了
                alert('恭喜你，游戏通过');
            }else{
                alert('游戏失败');
                this.gameOver();
            }
        }
    }
}

Mine.prototype.gameOver=function(clickTd){
    /*
        1、显示所有的雷
        2、其他点击事件取消
        3、选中当前的雷颜色变红
    */ 
    for(var i =0;i<this.tr;i++){
        for(var j=0;j<this.td;j++){
            if(this.squares[i][j].type=='mine'){
                this.tds[i][j].className = 'mine';
            }
            this.tds[i][j].onmousedown = null;
        }
    }
    if(clickTd){
        clickTd.style.backgroundColor = '#f00';
    }
}

//button功能
var btns = document.querySelectorAll('.level button');
var mine=null;	//用来存储生成的实例
var ln=0;	//用来处理当前选中的状态
var arr=[[9,9,10],[16,16,40],[28,28,99]];	//不同级别的行数列数雷数

for(let i=0;i<btns.length-1;i++){
	btns[i].onclick=function(){
		btns[ln].className='';
		this.className='active';

		mine=new Mine(...arr[i]);
		mine.init();

		ln=i;
	}
}
btns[0].onclick();
btns[3].onclick=function(){
	mine.init();
}



// var mine=new Mine(28,28,99);
// mine.init();
// console.log(mine.getAround(mine.squares[0][0]));
