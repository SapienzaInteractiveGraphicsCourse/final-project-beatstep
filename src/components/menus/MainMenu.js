import Menu from "./Menu";

class MainMenu extends Menu{

    constructor(playCallback = ()=>{}){
        
        super("IG Final Project");
        this.createBtn("Play",()=>playCallback(0))
        this.createBtn("Dojo",()=>playCallback(1))
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