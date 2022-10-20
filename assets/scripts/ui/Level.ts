import { _decorator, Component, Node, Prefab, Label, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Level')
export class Level extends Component {

    @property(Prefab)
    levelupPrefab: Prefab = null

    @property(Node)
    levelLabel: Node = null

    public defaultLevel = 1
    public currentlyLevel = this.defaultLevel

    private endless = false


    public levelConfig: Map<number, Map<string, number>> = new Map([
        [1, new Map([["max", 2], ["score", 20]])],
        [2, new Map([["max", 3], ["score", 50]])],
        [3, new Map([["max", 4], ["score", 100]])],
        [4, new Map([["max", 5], ["score", 300]])],
        [5, new Map([["max", 6], ["score", 500]])],
        [6, new Map([["max", 7], ["score", 500]])],
    ])


    onLoad() {


    }

    start() {

    }

    update(deltaTime: number) {

    }


    getInitLevelInfo() {
        return this.levelConfig.get(this.currentlyLevel)

    }

    restart() {
        this.currentlyLevel = this.defaultLevel
        this.levelLabel.getComponent(Label).string = "Level: " + this.currentlyLevel
    }

    isLevelUp(score: number): boolean {
        let LevelInfo = this.levelConfig.get(this.currentlyLevel)
        if (!this.endless) {
            if (score >= LevelInfo.get("score")) {
                if (this.currentlyLevel < this.levelConfig.size) {
                    this.currentlyLevel += 1
                    this.levelLabel.getComponent(Label).string = "Level: " + this.currentlyLevel
                    return true
                } else {
                    // 通关，无尽判断
                    this.endless = true
                    this.levelLabel.getComponent(Label).string = "Level: MAX"
                    this.currentlyLevel = 9999
                }

            }

        } 
        return false

    }
}

