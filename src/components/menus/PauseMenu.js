

class PauseMenu {

    constructor(resumeCallback = ()=>{}){
        
        this.backdrop = document.createElement("div");
        this.backdrop.classList.add("menu_backdrop");
        this.backdrop.classList.add("pause");

        // Main screen
        this.board = document.createElement("div");
        this.board.classList.add("menu_board");
        this.backdrop.append(this.board);

        this.boardTitle = document.createElement("div");
        this.boardTitle.classList.add("menu_title");
        this.boardTitle.innerText = "Pause";
        this.board.append(this.boardTitle);

        this.playBtn = document.createElement("div");
        this.playBtn.classList.add("menu_button");
        this.playBtn.innerText = "Resume";
        this.playBtn.addEventListener("click",()=>{
            resumeCallback();
        })
        this.board.append(this.playBtn);

        this.infoBtn = document.createElement("div");
        this.infoBtn.classList.add("menu_button");
        this.infoBtn.innerText = "How to play";
        this.infoBtn.addEventListener("click",()=>{
            this.board.classList.add("rotation");
            this.htpBoard.classList.remove("backrotation");
        })
        this.board.append(this.infoBtn);

        this.creditBtn = document.createElement("div");
        this.creditBtn.classList.add("menu_button");
        this.creditBtn.innerText = "Credits";
        this.creditBtn.addEventListener("click",()=>{
            this.board.classList.add("rotation");
            this.credBoard.classList.remove("backrotation");
        })
        this.board.append(this.creditBtn);


        // HowToPlay screen
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
        this.htpText.innerHTML = `You are an agent training in a very realistic disaster simulator ! <br />
                                Get to the end of the simulation without getting killed by rogue robots
                                or exploding on some weirdly misplaced exploding barrels (Why are there gas barrels again ?). <br /><br />
                                &bull; Use WASD to move around and the mouse to change your direction <br />
                                &bull; Press E near objects to interact with them <br />
                                &bull; Use the right mouse button to shoot at robots or barrels <br />
                                &bull; Press Esc to pause the game`;
        this.htpBoard.append(this.htpText);

        this.htpBackBtn = document.createElement("div");
        this.htpBackBtn.classList.add("menu_button");
        this.htpBackBtn.innerHTML = "&larr; Back";
        this.htpBackBtn.addEventListener("click",()=>{
            this.board.classList.remove("rotation");
            this.htpBoard.classList.add("backrotation");
        })
        this.htpBoard.append(this.htpBackBtn);


        // Credits screen
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

    addToPage(){
        document.body.append(this.backdrop);
    }

    removeFromPage(){
        document.body.removeChild(this.backdrop);
    }

}

export default PauseMenu;