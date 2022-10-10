import { _decorator, Component, Node, Prefab, CCInteger, instantiate, v3, Vec3, Label } from 'cc';
import { BoxItem } from '../game/BoxItem';
import { Player } from '../game/Player';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    private right_x = 310
    private left_x = -this.right_x
    private top_y = 620
    private bottom_y = -this.top_y

    @property(Player)
    player = null

    @property(Node)
    sourceLabel = null

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

    private source: number = 0




    onLoad() {
        for (let i = 0; i < this.boxNum; i++) {
            let node = instantiate(this.boxPrefab)
            let group_num = this.randomChoice(0, 0)
            node.getComponent(BoxItem).init(group_num, this.groupMap.get(group_num))
            let x = this.randomChoice(this.left_x, this.right_x)
            let y = this.randomChoice(this.bottom_y, this.top_y)
            node.setPosition(v3(x, y, 0))
            // console.log(node.getComponent(BoxItem).getR())

            this.boxRootNode.addChild(node)

        }

    }

    start() {


    }

    update(deltaTime: number) {
        this.allPosSave(this.boxRootNode.children)
        this.boxEliminate()

    }

    // 箱体消除算法
    private boxEliminate() {
        let items = this.boxRootNode.children

        items.forEach((item) => {
            // 存放递归中已判断的Node，避免重复判断
            let disItems: Map<Node, number> = new Map()
            disItems.set(item, 1)
            this.eliminate(item, 0, disItems)
        })


    }

    // 核心，递归消除算法
    // 返回值说明 1:重复节点 2:正常消除返回 3:递归终止
    private eliminate(item: Node, count: number, disItems: Map<Node, number>): number {

        let adjacentItems = this.getSameNodeAdjacent(item)

        let isEliminate = 3

        for(var i=0;i<adjacentItems.length;i++){
            let nextItem = adjacentItems[i]
            if (disItems.get(nextItem) == 1) {
                continue
            } else {
                // 存放递归中已判断的Node，避免重复判断
                disItems.set(nextItem, 1)
                count += 1
                isEliminate = this.eliminate(nextItem, count, disItems)
            }
        }

        // 终止条件
        if (count >= this.destoryNum && isEliminate == 3) {
            console.log("End")
            setTimeout(() => {
                if (item.isValid) {

                    console.log(item)
                    console.log(count)
                    item.destroy()
                    this.allBoxInfo.delete(item)
                    this.source += count
                    console.log("srouce:" ,this.source)

                }
            }, 0)

            this.sourceLabel.getComponent(Label).string = "分数:" + this.source

            return 2
        }
        if (isEliminate == 2) {
            console.log("Mid")
            setTimeout(() => {
                if (item.isValid) {

                    console.log(item)
                    console.log(count)
                    item.destroy()
                    this.allBoxInfo.delete(item)
                    this.source += count
                    console.log("srouce:" ,this.source)

                }
            }, 0)

            this.sourceLabel.getComponent(Label).string = "分数:" + this.source
            return 2
        }
        else {
            console.log("None")
            console.log(count)
            console.log("srouce:" ,this.source)
            return 1
        }
    }

    // 存储所有节点的位置
    private allPosSave(items: readonly Node[]) {
        items.forEach((item) => {
            this.check_border(item, item.getPosition().x, item.getPosition().y)
            let box = item.getComponent(BoxItem)

            this.allBoxInfo.set(item, [box.getR(), box.getPos(), box.getGroup()])
        })

    }

    // 获取目标节点相邻同类节点
    private getSameNodeAdjacent(item: Node): Node[] {
        let adjacentNode: Node[] = []
        let sourceNodeInfo = this.allBoxInfo.get(item)
        let sourcePos = sourceNodeInfo[1]
        let sourceR = sourceNodeInfo[0]
        let sourceGroup = sourceNodeInfo[2]
        this.allBoxInfo.forEach((value: [number, Vec3, number], key: Node) => {
            if (item != key) {
                // 同类判断
                if (sourceGroup == value[2]) {
                    // 相邻判断
                    let distance = Math.sqrt(Math.pow((sourcePos.x - value[1].x), 2) + Math.pow((sourcePos.y - value[1].y), 2))
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
        let num = Math.random() * (max - (min) + 1) + min
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

