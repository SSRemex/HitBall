import { _decorator, Component, Node, Camera, EventTouch, v3, UITransform, v2, Vec2, Vec3 } from 'cc';
import { Player } from '../game/Player';
const { ccclass, property } = _decorator;

@ccclass('Joystick')
export class Joystick extends Component {

    @property(Camera)
    uiCamera: Camera = null

    @property(Player)
    payler: Player = null

    @property(Node)
    leftArrow: Node = null

    @property(Node)
    rightArrow: Node = null

    public defaultAngle: number = 90
    public angle: number = this.defaultAngle
    private angleSpeed: number = 0.5

    // 按钮长按效果
    private leftHold: boolean = false
    private rightHold: boolean = false



    onLoad() {
        const { TOUCH_START, TOUCH_CANCEL, TOUCH_END, TOUCH_MOVE } = Node.EventType

        this.rightArrow.on(TOUCH_START, this.rightStart, this)
        this.leftArrow.on(TOUCH_START, this.leftStart, this)

        this.rightArrow.on(TOUCH_END, this.rightEnd, this)
        this.rightArrow.on(TOUCH_CANCEL, this.rightEnd, this)
        this.leftArrow.on(TOUCH_END, this.leftEnd, this)
        this.leftArrow.on(TOUCH_CANCEL, this.leftEnd, this)



    }

    private rightStart(event: EventTouch) {
        this.rightHold = true
        this.turnRight()
    }

    private leftStart(event: EventTouch) {
        this.leftHold = true
        this.turnLeft()

    }

    private rightEnd(event: EventTouch) {
        this.rightHold = false
        this.stopRight()

    }

    private leftEnd(event: EventTouch) {
        this.leftHold = false
        this.stopLeft()

    }

    private turnRight() {
        this.rightArrow.scale = v3(0.9, 0.9, 0.9)

        this.angle -= 1 * this.angleSpeed
        // 限制角度
        this.angle = this.limitAngle(this.angle)
        this.payler.colimator.angle = this.angle
        this.payler.colimatorRadian = this.angle_to_randian(this.payler.colimator.angle)
    }

    private turnLeft() {
        this.leftArrow.scale = v3(0.9, 0.9, 0.9)
        this.angle += 1 * this.angleSpeed
        // 限制角度
        this.angle = this.limitAngle(this.angle)
        this.payler.colimator.angle = this.angle
        this.payler.colimatorRadian = this.angle_to_randian(this.payler.colimator.angle)
    }

    private stopRight() {
        this.rightArrow.scale = v3(1, 1, 1)
    }
    private stopLeft() {
        this.leftArrow.scale = v3(1, 1, 1)
    }



    update() {
        if (this.rightHold) {
            this.turnRight()
        }
        if (this.leftHold) {
            this.turnLeft()
        }

    }

    // 准星角度限制 0-180° 用于弧度计算
    limitAngle(angle: number): number {
        let new_angle = angle
        if (angle < 0) {
            new_angle = 0
        }

        if (angle > 180) {
            new_angle = 180
        }

        return new_angle

    }

    // 半径限制
    limitMidNodePos(pos: Vec3): Vec3 {
        const R = 80
        // 获取当前位置长度
        const len = pos.length()
        // 计算 len 与R的关系，比例限制
        const ratio = len > R ? R / len : 1

        return new Vec3(pos.x * ratio, pos.y * ratio)
    }

    // 弧度转角度
    randian_to_angle(radian: number): number {
        // 弧度转角度公式
        // 180 / PI * 弧度

        // 计算出角度
        let angle = 180 / Math.PI * radian
        // 返回弧度

        return angle
    }

    // 角度转弧度
    angle_to_randian(angle: number): number {
        let radian = Math.PI / 180 * angle
        return radian
    }

    // 角度转向量
    angle_to_vector(angle: number): Vec2 {
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
    vector_to_angle(vector: Vec2): number {
        // 将传入向量归一化
        let dir = vector.normalize()
        // 计算出目标角度的弧度
        let radian = dir.signAngle(new Vec2(1, 0))
        // 把弧度计算成角度
        let angle = -this.randian_to_angle(radian)

        return angle
    }



}

