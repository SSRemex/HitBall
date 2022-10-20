import { _decorator, Component, Node, Prefab, CCInteger, instantiate, Animation, v3, Vec3, Label, director, tween, PhysicsSystem2D, EPhysics2DDrawFlags, CircleCollider2D, TTFFont, sys } from 'cc';
import { Ball } from '../game/Ball';
import { Player } from '../game/Player';
import { Tools } from '../Tools';
import { Level } from './Level';

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
    scoreLabel = null

    @property(Node)
    joystick: Node = null

    @property(Node)
    score: Node = null

    @property(Node)
    player: Node = null

    @property(Node)
    levelLabel: Node = null

    @property(Prefab)
    levelUpPrefab: Prefab = null


    // 箱子所挂载根节点
    @property(Node)
    ballRootNode: Node = null
    static ballRootNodeCopy: Node = undefined


    @property(Prefab)
    ballPrefab: Prefab = null

    @property(CCInteger)
    ballNum = 10

    private playerScore: number = 0
    // 阶段分 每100分 hp + 1
    private stageScore: number = 0

    private bulletGenerateSpeed = 0.2

    // 最大小球编号
    private max = 1

    // 升级动画节点
    private levelUpNode = null



    onLoad() {
        // 开启物理引擎
        PhysicsSystem2D.instance.enable = true
        // PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.All;

        Game.ballRootNodeCopy = this.ballRootNode

        this.UIManage("start")

        // 加载升级动画预制体
        this.levelUpNode = instantiate(this.levelUpPrefab)
        this.levelUpNode.active = false
        this.node.addChild(this.levelUpNode)



        // 按键事件
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

        console.log("platform", sys.platform)
    }

    update(deltaTime: number) {

        // 小球分裂
        this.ballSplit()

        // 阶段分超过100 hp + 1
        if (this.stageScore >= 100) {
            this.stageScore -= 100
            this.player.getComponent(Player).hp += 1
            this.player.getComponent(Player).hpLabel.getComponent(Label).string = this.player.getComponent(Player).hp.toString()
        }

        // 关卡升级判断
        if(this.levelLabel.getComponent(Level).isLevelUp(this.playerScore)){
            this.levelUpNode.active = true
            let anim = this.levelUpNode.getComponent(Animation)
            anim.play("levelup")
            this.max = this.levelLabel.getComponent(Level).getInitLevelInfo().get("max") - 1
        }


        // 游戏结束判定
        if (this.player.getComponent(Player).hp <= 0) {
            this.gameOver()
        }




    }

    // 初始化
    gameStart() {
        this.UIManage("none")
        this.joystick.active = true


        // 停止所有的定时任务
        this.unscheduleAllCallbacks()
        // 清空所有小球
        this.ballRootNode.removeAllChildren()
        // 当前最大小球编号初始化
        
        this.levelLabel.getComponent(Level).restart()
        this.max = this.levelLabel.getComponent(Level).getInitLevelInfo().get("max") - 1


        // 分数累计
        this.playerScore = 0
        this.stageScore = 0

        // 重置血量
        this.player.getComponent(Player).hp = this.player.getComponent(Player).defaultHp
        this.player.getComponent(Player).hpLabel.getComponent(Label).string = this.player.getComponent(Player).hp.toString()
        this.player.getChildByName("clip").removeAllChildren()
        //this.generateBall(this.ballNum)
        this.generateBall(5)
        // 每5秒生成2个球
        this.schedule(function () {
            if(this.ballRootNode.children.length <= 20) {
                this.generateBall(2)
            }
        }, 4)
        this.player.getComponent(Player).fire()
        this.schedule(function () {
            this.player.getComponent(Player).fire()
        }, this.bulletGenerateSpeed)

    }

    // 游戏结束
    gameOver() {

        director.pause()
        let resultScoreLabel = this.UI.getChildByPath("/over/scoreLabel").getComponent(Label)
        resultScoreLabel.string = "Score: " + this.playerScore
        this.UIManage("over")
        this.joystick.active = false


    }

    // 游戏重开
    gameRestart() {

        this.gameStart()
        this.scoreLabel.getComponent(Label).string = "Score: " + this.playerScore.toString() + "s"

        director.resume()


        console.log("restart")

    }

    // 小球分裂
    ballSplit() {
        this.ballRootNode.children.forEach((item) => {
            let ball = item.getComponent(Ball)
            if (ball.isSplit) {
                let node1_pos = item.getPosition()
                let node2_pos = item.getPosition()
                // 出现二者合到一起的情况, 生成位置错开
                node1_pos.x += 2
                node1_pos.y += 2
                node2_pos.x -= 2
                node2_pos.y -= 2

                let group = ball.getGroup() - 1

                // 索引小于0直接销毁
                if (group >= 0) {
                    let node_1 = instantiate(this.ballPrefab)
                    let node_2 = instantiate(this.ballPrefab)
                    node_1 = this.generateOneBall(node_1, group, node1_pos)
                    this.ballRootNode.addChild(node_1)
                    node_2 = this.generateOneBall(node_2, group, node2_pos)
                    this.ballRootNode.addChild(node_2)


                }
                // 销毁加分
                this.playerScore += group + 2
                this.stageScore += group + 2
                this.scoreLabel.getComponent(Label).string = "Score:" + this.playerScore
                item.destroy()


            }
        })
    }

    // 单一球体生成
    generateOneBall(node: Node, group: number, pos: Vec3): Node {
        // 先设置位置，否则初始化时pos会被归一化，指针传递
        let new_pos = pos
        node.setPosition(new_pos)
        node.getComponent(Ball).init(group, pos)


        return node
    }

    // 球体生成
    generateBall(num: number) {
        for (var i = 0; i < num; i++) {
            var node = instantiate(this.ballPrefab)
            var group = Tools.randomChoice(1, this.max)
            var x = Tools.randomChoice(this.left_x, this.right_x)
            // 控制小球生成位置在0以上
            var y = Tools.randomChoice(this.bottom_y + 700, this.top_y)
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

