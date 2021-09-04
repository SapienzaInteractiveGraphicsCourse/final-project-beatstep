import Menu from "./Menu";

class PauseMenu extends Menu{

    constructor(resumeCallback = ()=>{}, restartCallback = ()=>{}){

        super("Pause");
        this.createBtn("Resume",resumeCallback)
        this.createHtpBtn();
        this.createCreditsBtn();
        this.createMainMenuBtn(restartCallback);
        this.backdrop.classList.add("pause");      

        // HowToPlay screen
        this.createHtpPanel();

        // Credits screen
        this.createCreditsPanel();      
    }

}

export default PauseMenu;