import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Tools')
export class Tools extends Component {
    public static randomChoice(min: number, max: number) {
        var num = Math.random() * (max - (min) + 1) + min
        // 四舍五入取整
        return Math.round(num)
    }
}

