import Menu from "./Menu";

class DeathMenu extends Menu{

    constructor(restartCallback = ()=>{}){
        super("You Died");
        this.createMainMenuBtn(restartCallback);
        // this.createHtpBtn();
        this.createCreditsBtn();
        this.backdrop.classList.add("death");      

        // HowToPlay screen
        // this.createHtpPanel();

        // Credits screen
        this.createCreditsPanel();      

    }

}

export default DeathMenu;