var sw=20,//一个方块的宽
    sh=20,//一个方块的高
    tr=30,//列数
    td=30;//行数
var snake = null,//蛇的实例
    foof = null,//食物的实例
    game = null;//游戏的实例

function Square(x,y,classname){
    this.x = x*sw;
    this.y = y*sh;
    this.name = classname;

    this.viewContent = document.createElement("div");//方块对应的dom元素
    this.viewContent.className = this.name;
    this.parent = document.getElementById("snakeWrap");//方块的父级
}
Square.prototype.create = function(){ //创建方块DOM 并添加到父级里去
    this.viewContent.style.width = sw + "px";
    this.viewContent.style.height = sh + "px";
    this.viewContent.style.left = this.x + "px";
    this.viewContent.style.top = this.y + "px";

    this.parent.appendChild(this.viewContent);
}
Square.prototype.remove = function(){ //移除方块
    this.parent.removeChild(this.viewContent);
}

//蛇
function Snake(){
    this.head = null;//储存蛇头的信息
    this.tail = null;//储存蛇尾的信息
    this.pos = [];   //数组，储存蛇身上每一个方块的位置

    this.directionNum = {//储存蛇走的方向，用一个对象来表示
        left:{
            x:-1,
            y:0,
            rotate:180 //蛇头在不同方向中应该进行旋转，要不始终向右
        },
        right:{
            x:1,
            y:0,
            rotate:0
        },
        up:{
            x:0,
            y:-1,
            rotate:-90
        },
        down:{
            x:0,
            y:1,
            rotate:90
        }
    }
}

Snake.prototype.init = function(){//init 初始化
    //创建蛇头
    var snakeHead=new Square(2,0,'snakeHead');
    snakeHead.create();
    this.head = snakeHead;  //储存蛇头信息
    this.pos.push([2,0]);   //把蛇头的位置存放

    //创建蛇身体1
    var snakeBody1 =new Square(1,0,'snakeBody');
    snakeBody1.create();    
    this.pos.push([1,0]);   //把蛇身体的第一个坐标存

    //创建身体2
    var snakeBody2 =new Square(0,0,'snakeBody');
    snakeBody2.create();    
    this.tail = snakeBody2; //把蛇尾的信息存起来
    this.pos.push([0,0]);

    //形成链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    //给蛇添加一个属性，表示蛇初始走的方向
    this.direction = this.directionNum.right;//默认右走
};

//添加一个方法，用来获取蛇头的下一个位置对应的元素，要根据元素做不同的事情
Snake.prototype.getNextPos = function(){
    var nextPos = [//蛇头要走的下一个点的坐标
        this.head.x/sw + this.direction.x, //这里的direction.x相当于directionNum.right.x 
        this.head.y/sh + this.direction.y
    ]
    
    //撞倒自己时
    var selfColloed = false; //是否撞倒自己
    this.pos.forEach(function(value){
        if(value[0]==nextPos[0] && value[1]==nextPos[1]){
            selfColloed = true;
        }
    });
    if(selfColloed){
		console.log('撞到自己了！');
		
		this.startegies.die.call(this);

		return;
    }

    //撞倒墙
    if(nextPos[0]<0 ||nextPos[1]<0 ||nextPos[0]>td-1 ||nextPos[1]>tr - 1){
        console.log("撞倒墙了");
        this.startegies.die.call(this);
        return;
    }

    //撞倒食物
    if(food && food.pos[0]==nextPos[0] && food.pos[1]==nextPos[1]){
        console.log("吃到食物了");
        this.startegies.eat.call(this);
        return;
    }
    //没撞倒
    this.startegies.move.call(this);
};

//新方法，处理碰撞后的事
Snake.prototype.startegies = {
    move:function(format){ //这个参数用于决定要不要删除蛇尾
        //创建一个新的身体{再旧蛇头的位置}
        var newBody = new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
        //更变链表关系
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;

        this.head.remove();
        newBody.create();

        //创建一个新蛇头(蛇头下一个要走的点，可看作newPos)
        var newHead =new Square(this.head.x/sw + this.direction.x,this.head.y/sh + this.direction.y,'snakeHead');
        //更新链表关系
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;
        newHead.viewContent.style.transform = 'rotate('+this.direction.rotate+'deg)';
        newHead.create();

        //蛇身上每一个坐标也要更新。this.pos
        this.pos.splice(0,0,[this.head.x/sw + this.direction.x,this.head.y/sh + this.direction.y]);
        this.head = newHead;

        if(!format){
            this.tail.remove();
            this.tail = this.tail.last;

            this.pos.pop();
        }

    },
    eat:function(){
        this.startegies.move.call(this,true);
        createFood();
        game.score++;
    },
    die:function(){
        game.over();
    }
}

snake = new Snake();
// snake.init();
// snake.getNextPos();

//创建食物
function createFood(){
    //食物方块的随机坐标
    var x = null,
        y = null;

    var include = true; //循环跳出的条件,true表示食物的坐标在蛇身上(继续循环)，false表示食物的坐标不在蛇身上
    while(include){
        x=Math.round(Math.random()*(td-1));
		y=Math.round(Math.random()*(tr-1));

		snake.pos.forEach(function(value){
			if(x!=value[0] && y!=value[1]){
				//这个条件成立说明现在随机出来的这个坐标，在蛇身上并没有找到。
				include=false;
			}
		});
	}

    //创建食物
    food = new Square(x,y,'food');
    food.pos = [x,y];//存储食物的坐标用于跟蛇头要走的下一个点做对比

    var foodDom = document.querySelector('.food');
    if(foodDom){
        foodDom.style.left = x*sw+'px';
        foodDom.style.top = y*sh+'px';
    }else{
        food.create();
    }
}
// creatFood();


//创建游戏逻辑
function Game(){
    this.timer = null;
    this.score = 0;
}
Game.prototype.init=function(){
	snake.init();
	//snake.getNextPos();
	createFood();

    document.onkeydown=function(ev){
		if(ev.which==37 && snake.direction!=snake.directionNum.right){	//用户按下左键的时候，这条蛇不能是正下往右走
			snake.direction=snake.directionNum.left;
		}else if(ev.which==38 && snake.direction!=snake.directionNum.down){
			snake.direction=snake.directionNum.up;
		}else if(ev.which==39 && snake.direction!=snake.directionNum.left){
			snake.direction=snake.directionNum.right;
		}else if(ev.which==40 && snake.direction!=snake.directionNum.up){
			snake.direction=snake.directionNum.down;
		}
	}

    this.start();
}
Game.prototype.start = function(){ //开始游戏
    this.timer = setInterval(function(){
        snake.getNextPos();
    },200);
}
Game.prototype.pause = function(){ //暂停游戏
    clearInterval(this.timer);
}
Game.prototype.over = function(){  //结束游戏
    clearInterval(this.timer);
    alert('你的得分为：'+ this.score);

    //游戏回到最初时的状态
    var snakeWrap = document.getElementById("snakeWrap");
    snakeWrap.innerHTML = "";

    snake = new Snake();
    game = new Game();
    var startBtnWrap = document.querySelector('.startBtn')
    startBtnWrap.style.display = 'block';
}

//开启游戏
game = new Game();
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function(){
    startBtn.parentNode.style.display='none';
    game.init();
};

//暂停游戏
var snakeWrap = document.getElementById("snakeWrap");
var pauseBtn = document.querySelector('.pauseBtn button');
snakeWrap.onclick = function(){
    game.pause();
	pauseBtn.parentNode.style.display='block';
}
pauseBtn.onclick=function(){
	game.start();
	pauseBtn.parentNode.style.display='none';
}
