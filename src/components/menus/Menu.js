

class Menu {

    constructor(title){
        
        this.isShowing = false;
        this.btns = [];

        this.backdrop = document.createElement("div");
        this.backdrop.classList.add("menu_backdrop");

        this.board = document.createElement("div");
        this.board.classList.add("menu_board");
        this.backdrop.append(this.board);

        this.boardTitle = document.createElement("div");
        this.boardTitle.classList.add("menu_title");
        this.boardTitle.innerText = title;
        this.board.append(this.boardTitle);
    }

    addToPage(){
        document.body.append(this.backdrop);
        this.isShowing = true;
    }

    removeFromPage(){
        document.body.removeChild(this.backdrop);
        this.isShowing = false;
    }

    createBtn(btnText,callback){
        let playBtn = document.createElement("div");
        playBtn.classList.add("menu_button");
        playBtn.innerText = btnText;
        playBtn.addEventListener("click",()=>{
            callback(this);
        })
        this.board.append(playBtn);
    }

    createHtpPanel(){
        this.htpBoard = document.createElement("div");
        this.htpBoard.classList.add("menu_board");
        this.htpBoard.classList.add("backrotation");
        this.backdrop.append(this.htpBoard);

        this.htpBoardTitle = document.createElement("div");
        this.htpBoardTitle.classList.add("menu_title");
        this.htpBoardTitle.innerText = "How To Play";
        this.htpBoard.append(this.htpBoardTitle);

        this.htpText = document.createElement("div");
        this.htpText.classList.add("menu_text");
        this.htpText.innerHTML = `You are an agent training in a very realistic disaster simulator! <br />
                                Get to the end of the simulation without getting killed by rogue robots
                                or exploding on some weirdly misplaced exploding barrels (Why are there gas barrels again?). <br /><br />
                                &bull; Use WASD to move around and the mouse to change your direction <br />
                                &bull; Press E near doors and lamp lights to interact with them <br />
                                &bull; Use the left mouse button to shoot at robots or barrels <br />
                                &bull; Press Esc to pause the game <br />
                                &bull; Reach the computer and press E to end the simulation`;
        this.htpBoard.append(this.htpText);

        this.htpBackBtn = document.createElement("div");
        this.htpBackBtn.classList.add("menu_button");
        this.htpBackBtn.innerHTML = "&larr; Back";
        this.htpBackBtn.addEventListener("click",()=>{
            this.board.classList.remove("rotation");
            this.htpBoard.classList.add("backrotation");
        })
        this.htpBoard.append(this.htpBackBtn);
    }

    createHtpBtn(){
        this.infoBtn = document.createElement("div");
        this.infoBtn.classList.add("menu_button");
        this.infoBtn.innerText = "How to play";
        this.infoBtn.addEventListener("click",()=>{
            this.board.classList.add("rotation");
            this.htpBoard.classList.remove("backrotation");
        })
        this.board.append(this.infoBtn);
    }

    createCreditsPanel(){
        this.credBoard = document.createElement("div");
        this.credBoard.classList.add("menu_board");
        this.credBoard.classList.add("backrotation");
        this.backdrop.append(this.credBoard);

        this.credBoardTitle = document.createElement("div");
        this.credBoardTitle.classList.add("menu_title");
        this.credBoardTitle.innerText = "Credits";
        this.credBoard.append(this.credBoardTitle);

        this.credText = document.createElement("div");
        this.credText.classList.add("menu_text");
        this.credText.innerHTML = `This game has been made by Pasquale Silvestri and Marco Lo Pinto as the final project 
                                for the Interactive Graphics class of AI & Robotics at Sapienza University of Rome, held by Prof. Schaerf.
                                Technical informations present in the detailed report`;
        this.credBoard.append(this.credText);

        this.credBackBtn = document.createElement("div");
        this.credBackBtn.classList.add("menu_button");
        this.credBackBtn.innerHTML = "&larr; Back";
        this.credBackBtn.addEventListener("click",()=>{
            this.board.classList.remove("rotation");
            this.credBoard.classList.add("backrotation");
        })
        this.credBoard.append(this.credBackBtn);
    }

    createCreditsBtn(){
        this.creditBtn = document.createElement("div");
        this.creditBtn.classList.add("menu_button");
        this.creditBtn.innerText = "Credits";
        this.creditBtn.addEventListener("click",()=>{
            this.board.classList.add("rotation");
            this.credBoard.classList.remove("backrotation");
        })
        this.board.append(this.creditBtn);
    }

    createMainMenuBtn(restartCallback){
        this.menuBtn = document.createElement("div");
        this.menuBtn.classList.add("menu_button");
        this.menuBtn.innerText = "Main Menu";
        this.menuBtn.addEventListener("click",()=>{
            restartCallback(this);
        })
        this.board.append(this.menuBtn);
    }

}

export default Menu;