import { _decorator, Component, Node, Camera, EventTouch, v3, UITransform, v2, Vec2, Vec3 } from 'cc';
import { Ball } from '../game/Ball';
const { ccclass, property } = _decorator;

@ccclass('Joystick')
export class Joystick extends Component {

    @property(Camera)
    uiCamera: Camera = null

    @property(Node)
    stick: Node = null

    @property(Node)
    stickPanel: Node = null

    @property(Node)
    ballItem: Node = null

    private currentX = 0
    private currentY = 0
    
    // 摇杆向量
    public vector: Vec2 = v2(0, 0)
    public isLinear = false

    


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
        // 点击停止
        this.currentX = 0
        this.currentY = 0


    }
    private touchMOVE(event: EventTouch) {
        let touchPos = event.getLocation()
        let cameraPos = this.uiCamera.screenToWorld(v3(touchPos.x, touchPos.y, 0))
        // 相对控制板
        let pos = this.stickPanel.getComponent(UITransform).convertToNodeSpaceAR(cameraPos)
        pos.z = 0
        pos = this.limitMidNodePos(pos)
        this.stick.setPosition(pos)
        this.currentX = pos.x
        this.currentY = pos.y


    }
    // 一次摇杆只触发一次
    private touchEND(event: EventTouch) {
        
        this.vector = v2(this.currentX, this.currentY)
        this.isLinear = true
        this.stickPanel.active = false
        console.log(3)
        this.schedule(function(){
            this.vector = v2(0, 0)
        },0.1)
        // // 摇杆停止时停止运动
        // this.vector = v2(0, 0)
        // this.isLinear = true
        
    }


    update() {
        this.ballItem.children.forEach((item)=>{
            let ball = item.getComponent(Ball)
            this.ballControl(ball)
        })
    }

    // 小球控制
    ballControl(ball: Ball){
        ball.vector = this.vector
        let angle = this.vector_to_angle(ball, ball.vector)
        ball.angle = angle
        ball.isLinear = this.isLinear
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
    vector_to_angle (ball:Ball, vector: Vec2): number {
        // 将传入向量归一化
        let dir = vector.normalize()
        // 计算出目标角度的弧度
        if(dir.x === 0 && dir.y === 0) {
            return ball.angle
        }
        let radian = dir.signAngle(new Vec2(1, 0))
        // 把弧度计算成角度
        let angle = -this.randian_to_angle(radian)
        
        return angle
    }



}

