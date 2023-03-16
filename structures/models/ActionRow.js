const Button = require("./Button")
const StringSelect = require("./StringSelect")

module.exports = class ActionRow {
    constructor(...components){
        this.type = 1
        this.components = []
        if(components && components.length > 0) {
            this.addComponents(...components)
        }
    }

    addComponents(...components) {
        if(components.length < 1) throw new TypeError("No components")
        components.map(comp => {
            if(!comp.pack) {
                switch(comp.type) {
                    case 2: comp = new Button(comp); break;
                    case 3: comp = new StringSelect(comp); break;
                }
            }
            comp = comp.pack()
            if(!comp.custom_id) throw new TypeError("Custom Id is undefined")
            if(typeof comp.custom_id !== "string") throw new TypeError("The custom Id must be a string")
            if(comp.custom_id.length > 100) throw new TypeError("Custom Id max length of 100")
            if(this.components.find(c => c.custom_id === comp.custom_id)) throw new TypeError("Duplicated custom Id")
            if(this.components.find(c => c.type !== comp.type)) throw new TypeError("You can't use multiple component types in one row, create an other action row")
            this.components.push(comp)
        })
    }

    pack(){
        if(this.components.length < 1) throw new TypeError("Invalid components size")
        return {
            type: 1,
            components: this.components || []
        }
    }
}