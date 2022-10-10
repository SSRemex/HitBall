import { _decorator, Component, Node, Vec3, Sprite, Color, IColorLike, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BoxItem')
export class BoxItem extends Component {
    // 箱体分组
    public group: number = null
    public r: number = null

    init(group: number, color: string) {
        this.group = group
        this.r = this.node.getComponent(UITransform).contentSize.width * this.node.scale.x  / 2

        this.node.getComponent(Sprite).color = new Color().fromHEX(color)
    }


    public getPos(): Vec3 {
        return this.node.getPosition()
    }

    public getR(): number {
        return this.r
    }

    public getGroup(): number {
        return this.group
    }

    public destory(): void {
        this.node.destroy()
    }




}

