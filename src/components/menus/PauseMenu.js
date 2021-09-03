import Menu from "./Menu";

class PauseMenu extends Menu{

    constructor(resumeCallback = ()=>{}){

        super("Pause","Resume",resumeCallback);  
        this.createHtpBtn();
        this.createCreditsBtn();
        this.backdrop.classList.add("pause");      

        // HowToPlay screen
        this.createHtpPanel();

        // Credits screen
        this.createCreditsPanel();      
    }

}

export default PauseMenu;