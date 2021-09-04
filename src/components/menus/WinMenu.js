import Menu from "./Menu";

class WinMenu extends Menu{

    constructor(restartCallback = ()=>{}){
        
        super("You Won");
        this.createMainMenuBtn(restartCallback);
        this.createCreditsBtn();
        this.backdrop.classList.add("win");

        // Credits screen
        this.createCreditsPanel();  

    }

}

export default WinMenu;