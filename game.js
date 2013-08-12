var PLAYGROUND_WIDTH = 700;
var PLAYGROUND_HEIGHT = 250;
var REFRESH_RATE = 15;
var farParallaxSpeed = 1;
var closeParallaxSpeed = 3;
var enemyHeight = 16;
var enemyWidth = 16;
var enemySpawnRate = 1000;

function Enemy(node, value) {
  this.value = value;
  this.speed = 8;
  this.node = node;
  this.update = function() {
    this.node.x(-this.speed, true);
  };
};

var playerHeight = 32;
var playerWidth = 32;

function Player() {
  this.value = 10;
  this.number = 1;
};

var missileSpeed = 10;

var background1 = new $.gQ.Animation({imageURL: "background1.png"});
var background2 = new $.gQ.Animation({imageURL: "background2.png"}); 
var background3 = new $.gQ.Animation({imageURL: "background3.png"});
var background4 = new $.gQ.Animation({imageURL: "background4.png"});
var beetle = new $.gQ.Animation({imageURL: "beetle_32px.gif"});
var dung = new $.gameQuery.Animation({imageURL: "dung.png", numberOfFrame: 4, delta: 16, rate: 60, type:$.gameQuery.ANIMATION_HORIZONTAL});
var laser = new $.gameQuery.Animation({imageURL: "laser.png", numberOfFrame: 2, delta: 16, rate: 60, type:$.gameQuery.ANIMATION_HORIZONTAL});
var explode = new $.gameQuery.Animation({imageURL: "explode.png", numberOfFrame: 4, delta: 16, rate: 60, type:$.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_CALLBACK});

$("#playground").playground({height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH, keyTracker: true});

$.playground().addGroup("background", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
.addSprite("background1", {animation: background1, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
.addSprite("background2", {animation: background2, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT, posx: PLAYGROUND_WIDTH})
.addSprite("background3", {animation: background3, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
.addSprite("background4", {animation: background4, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT, posx: PLAYGROUND_WIDTH})
.end()
.addGroup("enemies", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
.end()
.addGroup("player", {posx: 0, posy: PLAYGROUND_HEIGHT/2, width: playerWidth, height: playerHeight})
.addSprite("playerBody", {animation: beetle, posx: 0, posy: 0, width: playerWidth, height: playerHeight})
.end()
.addGroup("playerMissileLayer", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
.end()

$("#player")[0].player = new Player();

// main loop
$.playground().registerCallback(function(){
  $("#background1").x(($("#background1").x() - farParallaxSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH);
  $("#background2").x(($("#background2").x() - farParallaxSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH);
  $("#background3").x(($("#background3").x() - closeParallaxSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH);
  $("#background4").x(($("#background4").x() - closeParallaxSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH);
  // enemy movement, collision with player, and removal
  $(".enemy").each(function(){
    this.enemy.update();
    if(($(this).x()+ enemyWidth) < 0){
      $(this).remove();
    } else {
      var collided = $(this).collision("#playerBody,."+$.gQ.groupCssClass);
      if(collided.length > 0){
        $("#player")[0].player.value += $(this)[0].enemy.value;
        $("#player")[0].player.number = $(this)[0].enemy.value;
        $("#player .value").html($("#player")[0].player.value);
        $("#player .number").html($("#player")[0].player.number);
        $(this).remove();
      }
    }
  });

  // missile collision
  $(".playerMissiles").each(function(){
    var posx = $(this).x();
    if(posx > PLAYGROUND_WIDTH){
      $(this).remove();
    }else{
      $(this).x(missileSpeed, true);
      var collided = $(this).collision(".enemy,."+$.gQ.groupCssClass);
      if(collided.length > 0){
        collided.each(function(){
          var thisEnemy = $(this);
          thisEnemy.setAnimation(explode, function(node){$(node).remove();});
        })
        $(this).remove();
      }
    }
  });

  if(jQuery.gameQuery.keyTracker[37]){
    var nextpos = $("#player").x()-5;
    if(nextpos > 0) {
      $("#player").x(nextpos);
    }
  }
  if(jQuery.gameQuery.keyTracker[39]){
    var nextpos = $("#player").x()+5;
    if(nextpos < PLAYGROUND_WIDTH - playerWidth) {
      $("#player").x(nextpos);
    }
  }

  if(jQuery.gameQuery.keyTracker[38]){
    var nextpos = $("#player").y()-5;
    if(nextpos > 0) {
      $("#player").y(nextpos);
    }
  }
  if(jQuery.gameQuery.keyTracker[40]){
    var nextpos = $("#player").y()+5;
    if(nextpos < PLAYGROUND_HEIGHT - playerHeight) {
      $("#player").y(nextpos);
    }
  }
}, REFRESH_RATE);

// enemy loop
$.playground().registerCallback(function() {
  var enemyValue = Math.ceil(Math.random()*21);
  var name = "enemy_" + (new Date).getTime();
  $("#enemies").addSprite(name, {animation: dung, posx: PLAYGROUND_WIDTH, posy: Math.random()*PLAYGROUND_HEIGHT*0.9, width: enemyWidth, height: enemyHeight});
  var enemyElement = $("#"+name);
  enemyElement.addClass("enemy");
  enemyElement[0].enemy = new Enemy(enemyElement, enemyValue);
}, enemySpawnRate);

// missile launching
$(document).keydown(function(e){
  if(e.keyCode === 32){
      var playerposx = $("#player").x();
      var playerposy = $("#player").y();
      var name = "playerMissile_"+(new Date()).getTime();
      $("#playerMissileLayer").addSprite(name, {animation: laser, posx: playerposx + playerWidth, posy: playerposy, width: playerWidth,height: playerHeight});
      $("#"+name).addClass("playerMissiles");
  }
});

$.loadCallback(function(percent){
    $("#loadingBar").width(5*percent);
});


$("#helpbutton").click(function(){
  $("#welcomeScreen").hide();
  $("#helpScreen").show();
})
    
$("#backbutton").click(function(){
  $("#helpScreen").hide();
  $("#welcomeScreen").show();
})

$("#startbutton").click(function(){
  $.playground().startGame(function(){
    $("#welcomeScreen").fadeTo(1000,0,function(){$(this).remove();});
  });
})
