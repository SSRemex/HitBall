import { _decorator, Component, Node, Vec2, v2, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property(CCInteger)
    speed = 2

    public vector: Vec2 = v2(0, 0)
    public angle:number = 0
    

    update() {
        // 向量归一化
        let dir = this.vector.normalize()
        this.node.angle = this.angle

        // 乘速度
        let dir_x = dir.x * this.speed
        let dir_y = dir.y * this.speed

        let x = this.node.position.x + dir_x
        let y = this.node.position.y + dir_y

        this.check_border(x, y)
    }

    check_border(x: number, y: number){
        const right_x = 310
        const left_x = -right_x
        const top_y = 620
        const bottom_y = -top_y

        x = x > right_x ? right_x : x
        x = x < left_x ? left_x : x
        y = y > top_y ? top_y : y
        y = y < bottom_y ? bottom_y : y

        this.node.setPosition(x, y)
    }

}

