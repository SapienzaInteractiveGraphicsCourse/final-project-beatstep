import Menu from "./Menu";

class MainMenu extends Menu{

    constructor(playCallback = ()=>{}){
        
        super("IG Final Project","Play",playCallback);  
        this.createHtpBtn();
        this.createCreditsBtn();
        this.backdrop.classList.add("main");      

        // HowToPlay screen
        this.createHtpPanel();

        // Credits screen
        this.createCreditsPanel();        
    }

}

export default MainMenu;