var res = {
    // HelloWorld_png : "HelloWorld.png",
    BackGround_png : "res/background.png",
    Start_N_png : "res/start_N.png",
    Start_S_png : "res/start_S.png",
    // Sushi_plist : "res/sushi.plist",
    // Sushi_png : "res/sushi.png",
    cell_png : "timg.jpg"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}

var maze;
var isT;

window.onload = function(){
    cc.game.onStart = function(){
        //load resources
        cc.LoaderScene.preload(g_resources, function () {
            cc.director.runScene(new StartScene());
        }, this);
    };
    cc.game.run("gameCanvas");

    var StartScene = cc.Scene.extend({
      touchListener:null,
      layer1:null,
      layer2:null,
      onEnter:function () {
        this._super();

        //add start menu
        var startItem = new cc.MenuItemImage(
                res.Start_N_png,
                res.Start_S_png,
                function () {
                    cc.log("Menu is clicked!");
                    cc.director.runScene(new GameScene());
                }, this);
        startItem.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height/2,
            anchorX: 0.5,
            anchorY: 0.5
        });
        
        var menu = new cc.Menu(startItem);
        menu.x = 0;
        menu.y = 0;
        
        var layer1 = cc.Layer.create();
        this.layer1 = layer1;
        // add bg
        var bgSprite = cc.Sprite.create(res.BackGround_png);
        bgSprite.attr({
          x: cc.winSize.width / 2,
          y: cc.winSize.height / 2,
        });
        layer1.addChild(bgSprite);

        var layer2 = cc.Layer.create();
        layer2.x = cc.winSize.width;
        layer2.addChild(menu, 0);
        this.layer2 = layer2;

        this.addChild(layer1, 1);
        this.addChild(layer2, 1);

        this.addTouchEventListenser();
        // var menu = new cc.Menu.create({
        // });
        
        this.toTab2();
      },

      addTouchEventListenser:function() {
        var self = this;
        this.touchListener = cc.EventListener.create({
              event: cc.EventListener.TOUCH_ONE_BY_ONE,
              // When "swallow touches" is true, then returning 'true' from the onTouchBegan method will "swallow" the touch event, preventing other listeners from using it.
              swallowTouches: true,
              begin_X: 0,
              begin_Y: 0,

              onSlideLeft: function() {
                self.toTab2();
              },
              onSlideRight: function() {
                self.toTab1();
              },
              onSlideUp: function() {},
              onSlideDown: function() {},

              //onTouchBegan event callback function                      
              onTouchBegan: function (touch, event) { 
                cc.log(21213);
                this.begin_X = touch.getLocation().x;
                this.begin_Y = touch.getLocation().y;

                return true;
              },
              onTouchMoved: function (touch, event) {
                // self.layer1.x = touch.getLocation().x-this.begin_X;
                return true;
              },
              onTouchEnded: function (touch, event) {
                // alert(321);
                var offsetX = touch.getLocation().x - this.begin_X;
                var offsetY = touch.getLocation().y - this.begin_Y;
                if (offsetX*offsetX > offsetY*offsetY) {
                  if (offsetX > 50) {
                    this.onSlideRight();
                  } else if (offsetX < -50) {
                    this.onSlideLeft();
                  }
                } else {
                  if (offsetY > 50) {
                    onSlideUp();
                  } else if (offsetY < -50) {
                    onSlideDown();
                  }
                }

                return false;
              }
            });
        cc.eventManager.addListener(this.touchListener, this);
      },

      toTab1:function() {
        cc.log("totab1");
        var action = cc.MoveTo.create(0.5, cc.p(0, 0));
        this.layer1.runAction(action);
        action = cc.MoveTo.create(0.5, cc.p(cc.winSize.width, 0));
        this.layer2.runAction(action);
      },
      toTab2:function() {
        cc.log("totab2");
        var action = cc.MoveTo.create(0.5, cc.p(-cc.winSize.width, 0));
        this.layer1.runAction(action);
        action = cc.MoveTo.create(0.5, cc.p(0, 0));
        this.layer2.runAction(action);
      }
    });

    var GameScene = cc.Scene.extend({
      onEnter:function () {
        this._super();
        var mazeLayer = new MazeLayer();
        this.addChild(mazeLayer, 1);
      }
    });

    var MazeLayer = cc.Layer.extend({
      player:null,
      bgSprite:null,
      scoreLabel:null,
      touchListener:null,
      cell_row:null,
      cell_col:null,
      cell_width:null,
      cell_arr: [],
      ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        this.width = 300;
        this.height = 300;
        this.x = (cc.winSize.width-this.width)/2;
        this.y = (cc.winSize.height-this.height)/2;
        this.cell_row = 31;
        this.cell_col =31;
        this.cell_width = this.width/this.cell_row < this.height/this.cell_col ? this.width/this.cell_row : this.height/this.cell_col;

        var size = cc.winSize;

        // add bg
        // commen
        // this.bgSprite = new cc.Sprite(res.BackGround_png);
        // this.bgSprite.attr({
        //   x: size.width / 2,
        //   y: size.height / 2,
        // });
        // this.addChild(this.bgSprite, 0);
        
        this.randomMaze(this.cell_row, this.cell_col, this.cell_width);

        this.player = new Player(res.cell_png, cc.rect(0, 0, this.cell_width/1.5, this.cell_width/1.5));
        this.player.attr({
          step_length: this.cell_width,
          row: 1,
          col: 1,
          cell_row: this.cell_row,
          cell_col: this.cell_col,
          x: this.cell_width+this.cell_width/2,
          y: this.cell_width+this.cell_width/2,
        });
        this.addChild(this.player, 0);

        this.addTouchEventListenser();
      },

      addTouchEventListenser:function() {
        var self = this;
        //touch event
        this.touchListener = cc.EventListener.create({
          event: cc.EventListener.TOUCH_ONE_BY_ONE,
          // When "swallow touches" is true, then returning 'true' from the onTouchBegan method will "swallow" the touch event, preventing other listeners from using it.
          swallowTouches: true,
          begin_X: 0,
          begin_Y: 0,
          //onTouchBegan event callback function                      
          onTouchBegan: function (touch, event) { 
            this.begin_X = touch.getLocation().x;
            this.begin_Y = touch.getLocation().y;

            return true;
          },
          onTouchMoved: function (touch, event) {
            return true;
          },
          onTouchEnded: function (touch, event) {
            // alert(321);
            var offsetX = touch.getLocation().x - this.begin_X;
            var offsetY = touch.getLocation().y - this.begin_Y;
            if (offsetX*offsetX > offsetY*offsetY) {
              if (offsetX > 50) {
                self.player.moveright();
                self.updateCell();
                self.arriveLinsten();
              } else if (offsetX < -50) {
                self.player.moveleft();
                self.updateCell();
                self.arriveLinsten();
              }
            } else {
              if (offsetY > 50) {
                self.player.moveup();
                self.updateCell();
                self.arriveLinsten();
              } else if (offsetY < -50) {
                self.player.movedown();
                self.updateCell();
                self.arriveLinsten();
              }
            }

            return false;
          }
        });

        cc.eventManager.addListener(this.touchListener, this);
      },
      arriveLinsten:function() {
        if (this.player.row == this.cell_row-1 && this.player.col == this.cell_col-1) {
          cc.director.popScene();
          alert("win");
        }
      },
      randomMaze:function(row, col, cell_width) {

        maze = new Array(row);
        isT = new Array(row);
        for (var i = 0; i < row; ++i) {
          maze[i] = new Array(col);
          isT[i] = new Array(col);
        }

        for (var i = 0; i < row; ++i) {
          for (var j = 0; j < col; ++j) {
            // maze[i][j] = Math.floor(Math.random()*2);
            maze[i][j] = 1;
            isT[i][j] = 0;
          }
        }
        maze[0][0] = 0;
        maze[0][1] = 0;
        maze[1][0] = 0;
        maze[1][1] = 0;
        maze[row-1][col-1] = 0;
        maze[row-2][col-1] = 0;
        maze[row-1][col-2] = 0;
        maze[row-2][col-2] = 0;

        recursive(1, 1, row, col);

        for (var i = 0; i < row; ++i) {
          for (var j = 0; j < col; ++j) {
            if (maze[i][j] == 1) {
              this.addCell(cell_width, i, j);
            }
          }
        }
      },

      addCell:function(cell_width, row, col) {
          var ran_num = Math.floor(Math.random()*100);
          var offset = ran_num;
          var cell = new Cell(res.cell_png, cc.rect(0+offset, 0+offset, cell_width, cell_width));
          cell.attr({
            row: row,
            col: col,
            x: cell_width*row+cell_width/2,
            y: cell_width*col+cell_width/2,
          });
          this.addChild(cell, 0);
          this.cell_arr.push(cell);
      },
      updateCell:function() {
        for (var i = 0; i < this.cell_arr.length; ++i) {
          var dis = Math.sqrt((this.cell_arr[i].row-this.player.row)*(this.cell_arr[i].row-this.player.row)+
            (this.cell_arr[i].col-this.player.col)*(this.cell_arr[i].col-this.player.col));
          if (dis < this.player.eye_shot && !this.cell_arr[i].isVisiable) {
            this.cell_arr[i].fadeIn();
          } else if (dis >= this.player.eye_shot && this.cell_arr[i].isVisiable) {
            this.cell_arr[i].fadeOut();
          }
        }
      }

    });

    var Cell = cc.Sprite.extend({
      row: null,
      col: null,
      isVisiable:true,
      disappearAction:null,//消失动画
      appearAction:null,
      touchListener:null,
      index:null,//在数组中的索引
      
      onEnter:function () {
        // cc.log("onEnter");
        this._super();
        this.disappearAction = this.createDisappearAction();
        this.appearAction = this.createAppearAction();
        this.disappearAction.retain();
        this.appearAction.retain();
      },
      
      onExit:function () {
        cc.log("onExit");
        this.disappearAction.release();
        this.appearAction.release();
        this._super();
      },
      setImage:function() {

      },
      createDisappearAction : function() {
        return cc.fadeOut(0.2);
      },
      createAppearAction : function() {
        return cc.fadeIn(0.2);
      },
      fadeIn: function() {
        this.runAction(this.appearAction);
        // this.setOpacity(1);
        this.isVisiable = true;
      },
      fadeOut: function() {
        this.runAction(this.disappearAction);
        // this.setOpacity(0);
        this.isVisiable = false;
      }
  
    });

    var Player = cc.Sprite.extend({
      eye_shot: 10,
      step_length: null,
      row: 0,
      col: 0,
      cell_row: null,
      cell_col: null,
      disappearAction:null,//消失动画
      touchListener:null,
      index:null,//在数组中的索引
      
      // ctor:function () {
      //   this._super();

      //   // for ()
      // },

      onEnter:function () {
        cc.log("onEnter");
        this._super();
      },
      
      onExit:function () {
        cc.log("onExit");
        this._super();
      },

      moveright:function() {
        cc.log("right");
        if (this.row+1 < this.cell_row && maze[this.row+1][this.col] == 0) {
          var action = cc.MoveBy.create(0.1, cc.p(this.step_length, 0));
          this.runAction(action);
          ++this.row;
        }
      },
      moveleft:function() {
        cc.log("left");
        if (this.row-1 >= 0 && maze[this.row-1][this.col] == 0) {
          var action = cc.MoveBy.create(0.1, cc.p(-this.step_length, 0));
          this.runAction(action);
          --this.row;
        }
      },
      moveup:function() {
        cc.log("up");
        if (this.col+1 < this.cell_col && maze[this.row][this.col+1] == 0) {
          var action = cc.MoveBy.create(0.1, cc.p(0, this.step_length));
          this.runAction(action);
          ++this.col;
        }
      },
      movedown:function() {
        cc.log("down");
        if (this.col-1 >= 0 && maze[this.row][this.col-1] == 0) {
          var action = cc.MoveBy.create(0.1, cc.p(0, -this.step_length));
          this.runAction(action);
          --this.col;
        }
      },
      fadeIn:function() {
        cc.log("fadeIn");
          var action = cc.fadeIn.create(0.2);
          this.runAction(action);
      },
      fadeOut:function() {
        cc.log("fadeOut");
          var action = cc.fadeOut.create(0.2);
          this.runAction(action);
      }
    });

  
        // used to try to do, now give up
        var EventListenerTouchOneByOne = cc.EventListener.extend({
        });
};

function recursive(x, y, row, col) {
    maze[x][y] = 0;
    isT[x][y] = 1;

    if (!canmove(x, y, row, col)) {
      return;
    }

    while (true) {
      var ran = Math.floor(Math.random()*4);
        if (ran == 0 && canright(x, y, row, col)) {
          maze[x][y+1] = 0;
          recursive(x, y+2, row, col);
        } else if (ran == 1 && canleft(x, y, row, col)) {
          maze[x][y-1] = 0;
          recursive(x, y-2, row, col);
        } else if (ran == 2 && candown(x, y, row, col)) {
          maze[x+1][y] = 0;
          recursive(x+2, y, row, col);
        } else if (ran == 3 && canup(x, y, row, col)) {
          maze[x-1][y] = 0;
          recursive(x-2, y, row, col);
        }

        if (!canmove(x, y, row, col)) {
          return;
        }
    }
}

function canright(x, y, row, col) {
  return (y+2 < col && isT[x][y+2] == 0);
}
function canleft(x, y, row, col) {
  return (y-2 >= 0 && isT[x][y-2] == 0);
}
function candown(x, y, row, col) {
  return (x+2 < row && isT[x+2][y] == 0);
}
function canup(x, y, row, col) {
  return (x-2 >= 0 && isT[x-2][y] == 0);
}

function canmove(x, y, row, col) {
  return canright(x, y, row, col) || canleft(x, y, row, col) || candown(x, y, row, col) || canup(x, y, row, col);
}
