import Menu from "./Menu";

class WinMenu extends Menu{

    constructor(restartCallback = ()=>{}){
        
        super("You Won","Main Menu",restartCallback);
        this.createCreditsBtn();
        this.backdrop.classList.add("win");

        // Credits screen
        this.createCreditsPanel();  

    }

}

export default WinMenu;