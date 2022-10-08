import { _decorator, Component, Node, Vec3, Sprite, Color, IColorLike } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BoxItem')
export class BoxItem extends Component {
    // 箱体分组
    public rootNode: Node = null
    public group: number = null

    init(rootNode: Node, group: number, color: string){
        this.group = group

        rootNode.getComponent(Sprite).color = new Color().fromHEX(color)
    }

    public getPos(): Vec3 {
        return this.rootNode.position
    }

    public destory():void {
        this.rootNode.destroy()
    }


    

}

