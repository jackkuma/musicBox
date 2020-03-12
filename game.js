const blockData = [
  { selector: ".block1", name: "1", pitch: "1" },
  { selector: ".block2", name: "2", pitch: "2" },
  { selector: ".block3", name: "3", pitch: "3" },
  { selector: ".block4", name: "4", pitch: "4" }
]
const soundsetDate = [
  { name: "correct", sets: [1,3,5,8]},
  { name: "wrong", sets: [2,4,5.5,7]}
]
const levelData = [
  "23",
  "1234",
  "12324",
  "231234",
  "41233412",
  "41323134132",
  "2342341231231423414232"
]
const Blocks = function(blockAssign, setAssign) {
  this.allOn = false
  this.blocks = blockAssign.map((data, i) => ({
    name: data.name,
    box: $(data.selector),
    audio: this.getAudioObject(data.pitch)
  }))
  this.soundSets = setAssign.map((data,i) => ({
    name: data.name,
    sets: data.sets.map((pitch) => this.getAudioObject(pitch))
  }))
}
Blocks.prototype.flash = function(note) {
  let block = this.blocks.find((data) => data.name == note)
  if (block) {
    block.audio.currentTime = 0
    block.audio.play()
    block.box.addClass("active")
    setTimeout(() => {
      if (this.allOn == false) {
        block.box.removeClass("active")
      }
    }, 100)
  }
}
Blocks.prototype.turnAllOn = function() {
  this.allOn = true;
  this.blocks.forEach(block => {
    block.box.addClass("active")
  })
}
Blocks.prototype.turnAllOff = function() {
  this.allOn = false;
  this.blocks.forEach(block => {
    block.box.removeClass("active")
  })
}
Blocks.prototype.getAudioObject = function(pitch) {
  return new Audio(`sound/${pitch}.wav`)
}
Blocks.prototype.playSet = function(type) {
  let sets = this.soundSets.find( set => set.name == type ).sets
  sets.forEach((obj) => {
    obj.currentTime = 0
    obj.play()
  })
}

const Game = function() {
  this.blocks = new Blocks(blockData,soundsetDate)
  this.levels = levelData
  this.currentLevel = 0
  this.playInterval = 400
  this.mode = "Waiting"
}
//遊戲關卡設定
//本地模式
Game.prototype.startLevel = function() {
  let leveldata = this.levels[this.currentLevel]
  this.startGame(leveldata)
  this.showMessage("Level " + this.currentLevel)
}
//顯示目前關卡
Game.prototype.showMessage = function(msg) {
  $(".status").text(msg)
}
//開始遊戲
Game.prototype.startGame = function(answer) {
  this.mode = "gamePlay"
  this.answer = answer
  let notes = this.answer.split("")
  this.showStatus("")
  this.timer = setInterval(() => {
    let char = notes.shift()
    this.playNote(char)
    if(!notes.length) {
      this.startUserInput()
      clearInterval(this.timer)
    }
  },this.playInterval)
}
//出題播放
Game.prototype.playNote = function(note) {
  this.blocks.flash(note)
}
//使用者解答
Game.prototype.startUserInput = function() {
  this.userInput = ""
  this.mode = "userInput"
}
Game.prototype.userSendInput = function(inputChar) {
  if(this.mode == "userInput") {
    let tempString = this.userInput + inputChar
    this.playNote(inputChar)
    this.showStatus(tempString)
    if(this.answer.indexOf(tempString) == 0) {
      if(this.answer == tempString) {
        this.showMessage("Correct")
        this.currentLevel += 1
        this.mode = "Waiting"
        setTimeout(() => {
          this.startLevel()
        },1000)
      }
    } else {
      this.showMessage("Wrong")
      this.currentLevel = 0
      this.mode = "Waiting"
      setTimeout(() => {
        this.startLevel()
      },2000)
    }
    this.userInput += inputChar
  }
}

Game.prototype.showStatus = function(tempString) {
  $(".inputStatus").html("")
  this.answer.split("").forEach((data,i) => {
    const circle = $("<div class='circle'></div>")
    if(i < tempString.length) {
      circle.addClass("correct")
    }
    $(".inputStatus").append(circle)
  })
  if(tempString == "") {
    this.blocks.turnAllOff()
  }
  if(tempString == this.answer) {
    $(".inputStatus").addClass("correct")
    setTimeout(() => {
      this.blocks.turnAllOn()
      this.blocks.playSet("correct")
    },500)
  } else {
    $(".inputStatus").removeClass("correct")
  }
  
  if(this.answer.indexOf(tempString) != 0) {
    $(".inputStatus").addClass("wrong")
    setTimeout(() => {
      this.blocks.playSet("wrong")
    },500)
  } else {
    $(".inputStatus").removeClass("wrong")
  }
}
const game = new Game()
game.loadLevels()
setTimeout(() => {
  game.startLevel()
},1000)
