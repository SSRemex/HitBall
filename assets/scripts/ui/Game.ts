import { _decorator, Component, Node, Prefab, CCInteger, instantiate, v3 } from 'cc';
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

    // 箱子所挂载根节点
    @property(Node)
    boxRootNode: Node = null

    @property(Prefab)
    boxItem: Prefab = null

    @property(CCInteger)
    boxNum = 10

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

    


    onLoad() {
        for (let i = 0; i < this.boxNum; i++) {
            let node = instantiate(this.boxItem)
            let group_num = this.randomChoice(0, this.groupMap.size-2)
            let box_item = node.getComponent(BoxItem)
            box_item.init(node, group_num, this.groupMap.get(group_num))
            let x = this.randomChoice(this.left_x, this.right_x)
            let y = this.randomChoice(this.bottom_y, this.top_y)
            node.setPosition(v3(x, y, 0))
            

            this.boxRootNode.addChild(node)
            
        }

    }

    start() {
        console.log(this.boxRootNode.children)
        
    }

    update(deltaTime: number) {

    }

    private randomChoice(min: number, max: number) {
        let num = Math.random() * (max - (min) + 1) + min
        // 四舍五入取整
        return Math.round(num)
    }

}

