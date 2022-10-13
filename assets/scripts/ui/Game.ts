import { _decorator, Component, Node, Prefab, CCInteger, instantiate, v3, Vec3, Label, director, tween, PhysicsSystem2D, EPhysics2DDrawFlags, CircleCollider2D  } from 'cc';
import { Ball } from '../game/Ball';
import { Tools } from '../Tools';

const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    private right_x = 310
    private left_x = -this.right_x
    private top_y = 520
    private bottom_y = -620 


    @property(Node)
    UI: Node = null

    @property(Node)
    startButton: Node = null

    @property(Node)
    restartButton: Node = null

    @property(Node)
    countDownLabel = null

    @property(Node)
    joystick: Node = null

    @property(Node)
    score: Node = null


    // 箱子所挂载根节点
    @property(Node)
    ballRootNode: Node = null
    static ballRootNodeCopy:Node = undefined
    

    @property(Prefab)
    ballPrefab: Prefab = null

    @property(CCInteger)
    countDown = 60

    @property(CCInteger)
    ballNum = 10


    private playerScore: number = 0

    private intervalTime: number

    onLoad() {
        // 开启物理引擎
        PhysicsSystem2D.instance.enable = true
        // PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.All;

        Game.ballRootNodeCopy = this.ballRootNode

        this.UIManage("start")
        this.joystick.active = false

        this.startButton.on(Node.EventType.TOUCH_START, () => {
            tween(this.startButton)
                .to(0.2, { scale: v3(0.9, 0.9, 0.9) }).start()

        }, this)

        this.startButton.on(Node.EventType.TOUCH_END, () => {
            tween(this.startButton)
                .to(0.2, { scale: v3(1, 1, 1) }).start()
            this.gameStart()

        }, this)

        this.restartButton.on(Node.EventType.TOUCH_START, () => {
            tween(this.startButton)
                .to(0.2, { scale: v3(0.9, 0.9, 0.9) }).start()

        }, this)

        this.restartButton.on(Node.EventType.TOUCH_END, () => {
            tween(this.startButton)
                .to(0.2, { scale: v3(0.9, 0.9, 0.9) }).start()
            this.gameRestart()

        }, this)
    }

    start() {
        // 检测游戏是否结束
        this.schedule(function(){
            this.countDown -= 1
            this.countDownLabel.getComponent(Label).string = "Time: " + this.countDown.toString() + "s"
            if(this.countDown <= 0){
                this.gameOver()
            }
        }, 1)
    }

    update(deltaTime: number) {
        this.intervalTime += deltaTime

        // 小球升级，刚体变换判断
        this.ballUpgrade()
        
        
    }

    // 初始化
    gameStart() {
        this.UIManage("none")
        this.joystick.active = true
        // 清空所有小球
        this.ballRootNode.removeAllChildren()

        // 时间累计
        this.intervalTime = 0
        this.playerScore = 0

        this.generateBall(this.ballNum)
        // 每3秒生成三个球
        // 只执行一次
        this.schedule(function () {
            this.generateBall(3)
        }, 3)

    }

    // 游戏结束
    gameOver() {

        director.pause()
        let score = 0
        this.ballRootNode.children.forEach((item) => {
            score += item.getComponent(Ball).getGroup() + 1
        })
        let resultScoreLabel = this.UI.getChildByPath("/over/scoreLabel").getComponent(Label)
        resultScoreLabel.string = "Score: " + score
        this.UIManage("over")
        this.joystick.active = false

    }

    // 游戏重开
    gameRestart() {
        this.gameStart()
        this.countDown = 10
        this.countDownLabel.getComponent(Label).string = "Time: " + this.countDown.toString() + "s" 
        director.resume()
        


        console.log("restart")

    }

    // 小球升级
    ballUpgrade() {
        this.ballRootNode.children.forEach((item)=>{
            let ball = item.getComponent(Ball)
            if(ball.isUpgrade){
                let pos = item.getPosition()
                let group = ball.getGroup()
                let node = instantiate(this.ballPrefab)
                node = this.generateOneBall(node, group, pos)
                this.ballRootNode.addChild(node)
                this.increaseTime(group+1)
                item.destroy()

            }
        })
    }

    // 加时
    increaseTime(count: number){
        // this.countDown += Math.round(count/6)
        this.countDown += 1
        this.countDownLabel.getComponent(Label).string = "Time: " + this.countDown.toString() + "s" 

    }

    // 单一球体生成
    generateOneBall(node:Node, group: number, pos: Vec3 ):Node {
        node.getComponent(Ball).init(group)
        node.setPosition(pos)

        return node
    }

    // 球体生成
    generateBall(num: number) {
        for (var i = 0; i < num; i++) {
            var node = instantiate(this.ballPrefab)
            var group = Tools.randomChoice(0, 1)
            var x = Tools.randomChoice(this.left_x, this.right_x)
            var y = Tools.randomChoice(this.bottom_y, this.top_y)
            var pos = v3(x, y, 0)
            node = this.generateOneBall(node, group, pos)

            this.ballRootNode.addChild(node)

        }
    }

    // UI开启隐藏
    UIManage(info: string) {
        if (info === "start") {
            this.UI.active = true
            this.UI.getChildByName("start").active = true
            this.UI.getChildByName("over").active = false
        }
        else if (info === "over") {
            this.UI.active = true
            this.UI.getChildByName("start").active = false
            this.UI.getChildByName("over").active = true
        }
        else {
            this.UI.active = false
            this.UI.getChildByName("start").active = false
            this.UI.getChildByName("over").active = false
        }

    }





    
}

