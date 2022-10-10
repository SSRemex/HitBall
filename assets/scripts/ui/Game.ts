import { _decorator, Component, Node, Prefab, CCInteger, instantiate, v3, Vec3, Label, director, tween, EventTouch } from 'cc';
import { BoxItem } from '../game/BoxItem';
import { Player } from '../game/Player';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    private right_x = 310
    private left_x = -this.right_x
    private top_y = 620
    private bottom_y = -this.top_y


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


    @property(Player)
    player = null

    @property(Node)
    score: Node = null


    // 箱子所挂载根节点
    @property(Node)
    boxRootNode: Node = null

    @property(Prefab)
    boxPrefab: Prefab = null

    @property(CCInteger)
    boxNum = 10

    @property(CCInteger)
    //相邻相同个数
    destoryNum = 2

    // 组别颜色
    private groupMap: Map<number, string> = new Map([
        [0, "FF0000"],
        [1, "00FF85"],
        [2, "0070FF"],
        [3, "7700FF"],
        [4, "FFFF00"],
        [5, "70FF00"],
        [6, "00FFAD"],
        [7, "0000FF"],
    ])


    // 全部box位置存储
    private allBoxInfo: Map<Node, [number, Vec3, number]> = new Map()

    private playerScore: number = 0

    private disItems: Map<Node, number> = new Map()

    private intervalTime: number

    onLoad() {
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




    }

    update(deltaTime: number) {
        this.intervalTime += deltaTime
        this.disItems.clear()
        this.allPosSave(this.boxRootNode.children)
        this.boxEliminate()



        // 检测游戏是否结束
        if (this.boxRootNode.children.length > 120) {
            this.gameOver()
        }

    }

    // 初始化
    gameStart() {
        this.UIManage("none")
        this.joystick.active = true
        // 清空所有小球
        this.boxRootNode.removeAllChildren()

        // 时间累计
        this.intervalTime = 0
        this.playerScore = 0

        this.generateBox(this.boxNum)
        // 每3秒生成三个球
        // 只执行一次
        this.schedule(function () {
            this.generateBox(3)
        }, 3)

    }

    // 游戏结束
    gameOver() {

        director.pause()

        this.scoreLabel.getComponent(Label).string = "分数:" + this.playerScore
        this.UIManage("over")
        this.joystick.active = false

    }

    // 游戏重开
    gameRestart() {
        this.gameStart()
        director.resume()


        console.log("restart")

    }

    // 球体生成
    generateBox(num: number) {
        for (var i = 0; i < num; i++) {
            var node = instantiate(this.boxPrefab)
            var group_num = this.randomChoice(0, this.groupMap.size - 2)
            node.getComponent(BoxItem).init(group_num, this.groupMap.get(group_num))
            var x = this.randomChoice(this.left_x, this.right_x)
            var y = this.randomChoice(this.bottom_y, this.top_y)
            node.setPosition(v3(x, y, 0))
            // console.log(node.getComponent(BoxItem).getR())

            this.boxRootNode.addChild(node)

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



    // 箱体消除算法
    private boxEliminate() {
        var items = this.boxRootNode.children

        items.forEach((item) => {
            // 存放递归中已判断的Node，避免重复判断

            if (this.disItems.get(item) != 1) {
                this.disItems.set(item, 1)
                let count = 1
                this.eliminate(item, count)
            }
        })

    }

    // 核心，递归消除算法
    // 返回值说明 1:重复节点 2:正常消除返回 3:递归终止
    private eliminate(item: Node, count: number): [number, number] {

        var adjacentItems = this.getSameNodeAdjacent(item)

        var isEliminate = [3, count]

        for (var i = 0; i < adjacentItems.length; i++) {
            var nextItem = adjacentItems[i]
            if (this.disItems.get(nextItem) === 1) {
                continue
            } else {
                // 存放递归中已判断的Node，避免重复判断
                this.disItems.set(nextItem, 1)
                count += 1
                isEliminate = this.eliminate(nextItem, count)
                if (isEliminate[0] === 2) {
                    break
                }
            }
        }

        if (isEliminate[0] === 2) {
            this.playerScore += isEliminate[1]
            this.score.getComponent(Label).string = "分数:" + this.playerScore
        }

        // 终止条件
        if (count >= this.destoryNum && isEliminate[0] === 3) {
            if (item.isValid) {
                setTimeout(() => {
                    // item.destroy()
                    this.boxRootNode.removeChild(item)
                    this.allBoxInfo.delete(item)


                }, 0)
            }

            return [2, isEliminate[1]]
        }
        if (isEliminate[0] === 2) {
            if (item.isValid) {
                setTimeout(() => {
                    // item.destroy()
                    this.boxRootNode.removeChild(item)
                    this.allBoxInfo.delete(item)
                }, 0)
            }

            return [2, isEliminate[1]]
        }
        else {
            return [1, 0]
        }
    }

    // 存储所有节点的位置
    private allPosSave(items: readonly Node[]) {
        items.forEach((item) => {
            this.check_border(item, item.getPosition().x, item.getPosition().y)
            var box = item.getComponent(BoxItem)

            this.allBoxInfo.set(item, [box.getR(), box.getPos(), box.getGroup()])
        })

    }

    // 获取目标节点相邻同类节点
    private getSameNodeAdjacent(item: Node): Node[] {
        var adjacentNode: Node[] = []
        var sourceNodeInfo = this.allBoxInfo.get(item)
        var sourcePos = sourceNodeInfo[1]
        var sourceR = sourceNodeInfo[0]
        var sourceGroup = sourceNodeInfo[2]
        this.allBoxInfo.forEach((value: [number, Vec3, number], key: Node) => {
            if (item != key) {
                // 同类判断
                if (sourceGroup == value[2]) {
                    // 相邻判断
                    var distance = Math.sqrt(Math.pow((sourcePos.x - value[1].x), 2) + Math.pow((sourcePos.y - value[1].y), 2))
                    // 距离 与 半径+偏差值 判断
                    if (distance <= ((value[0] + sourceR) * 1.1)) {
                        adjacentNode.unshift(key)
                    }
                }
            }
        })
        return adjacentNode
    }

    private randomChoice(min: number, max: number) {
        var num = Math.random() * (max - (min) + 1) + min
        // 四舍五入取整
        return Math.round(num)
    }

    // 检查位置
    check_border(item: Node, x: number, y: number) {

        x = x > this.right_x ? this.right_x : x
        x = x < this.left_x ? this.left_x : x
        y = y > this.top_y ? this.top_y : y
        y = y < this.bottom_y ? this.bottom_y : y

        item.setPosition(x, y)
    }

}

