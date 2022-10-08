import { _decorator, Component, Node, Camera, EventTouch, v3, UITransform, v2, Vec2, Vec3 } from 'cc';
import { Player } from '../game/Player';
const { ccclass, property } = _decorator;

@ccclass('Joystick')
export class Joystick extends Component {

    @property(Camera)
    uiCamera: Camera = null

    @property(Node)
    stick: Node = null

    @property(Node)
    stickPanel: Node = null

    @property(Player)
    player: Player = null
    
    // 摇杆向量
    public vector: Vec2 = v2(0, 0)

    onLoad() {
        const { TOUCH_START, TOUCH_CANCEL, TOUCH_END, TOUCH_MOVE } = Node.EventType

        this.node.on(TOUCH_START, this.touchStart, this)
        this.node.on(TOUCH_MOVE, this.touchMOVE, this)
        this.node.on(TOUCH_END, this.touchEND, this)
        this.node.on(TOUCH_CANCEL, this.touchEND, this)

    }

    private touchStart(event: EventTouch) {
        
        // 获取点击坐标 屏幕坐标
        let touchPos = event.getLocation()
        // 将屏幕坐标转为世界坐标
        let cameraPos = this.uiCamera.screenToWorld(v3(touchPos.x, touchPos.y, 0))
        // 将世界坐标转为节点相对坐标
        let pos = this.node.getComponent(UITransform).convertToNodeSpaceAR(cameraPos)
        this.stickPanel.setPosition(pos)
        this.stick.setPosition(pos)
        this.stickPanel.active = true


    }
    private touchMOVE(event: EventTouch) {
        let touchPos = event.getLocation()
        let cameraPos = this.uiCamera.screenToWorld(v3(touchPos.x, touchPos.y, 0))
        // 相对控制板
        let pos = this.stickPanel.getComponent(UITransform).convertToNodeSpaceAR(cameraPos)
        pos.z = 0
        pos = this.limitMidNodePos(pos)
        this.stick.setPosition(pos)
        this.vector = v2(pos.x, pos.y)

    }
    private touchEND(event: EventTouch) {
        this.stickPanel.active = false
        this.vector = v2(0, 0)
    }

    update() {
        this.player.vector = this.vector
        let angle = this.vector_to_angle(this.vector)
        this.player.angle = angle
    }

    // 半径限制
    limitMidNodePos(pos: Vec3): Vec3 {
        const R = 80
        // 获取当前位置长度
        const len = pos.length()
        // 计算 len 与R的关系，比例限制
        const ratio = len > R ? R / len  : 1

        return new Vec3(pos.x * ratio, pos.y * ratio)
    }

    // 弧度转角度
    randian_to_angle(radian: number): number{
        // 弧度转角度公式
        // 180 / PI * 弧度

        // 计算出角度
        let angle = 180 / Math.PI * radian
        // 返回弧度

        return angle
    }

    // 角度转弧度
    angle_to_randian(angle: number): number{
        let radian = Math.PI / 180 * angle
        return radian
    }

    // 角度转向量
    angle_to_vector (angle: number): Vec2 {
        // tan = sin /cos
        // 将传入的角度转为弧度
        let radian = this.angle_to_randian(angle)
        // 算出cos, sin, tan
        let cos = Math.cos(radian)
        let sin = Math.sin(radian)
        let tan = Math.tan(radian)

        // 结合在一起并归一化
        let vec = new Vec2(cos, sin).normalize()

        return vec
    }

    // 向量转角度
    vector_to_angle (vector: Vec2): number {
        // 将传入向量归一化
        let dir = vector.normalize()
        // 计算出目标角度的弧度
        if(dir.x === 0 && dir.y === 0) {
            return this.player.angle
        }
        let radian = dir.signAngle(new Vec2(1, 0))
        // 把弧度计算成角度
        let angle = -this.randian_to_angle(radian)
        
        return angle
    }



}

