

class Menu {

    constructor(){
        
        this.isShowing = false;

        this.backdrop = document.createElement("div");
        this.backdrop.classList.add("menu_backdrop");
    }

    addToPage(){
        document.body.append(this.backdrop);
        this.isShowing = true;
    }

    removeFromPage(){
        document.body.removeChild(this.backdrop);
        this.isShowing = false;
    }

}

export default Menu;