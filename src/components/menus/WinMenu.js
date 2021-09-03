import Menu from "./Menu";

class WinMenu extends Menu{

    constructor(restartCallback = ()=>{}){
        
        super();
        this.backdrop.classList.add("win");

        // Main screen
        this.board = document.createElement("div");
        this.board.classList.add("menu_board");
        this.backdrop.append(this.board);

        this.boardTitle = document.createElement("div");
        this.boardTitle.classList.add("menu_title");
        this.boardTitle.innerText = "You Won";
        this.board.append(this.boardTitle);

        this.playBtn = document.createElement("div");
        this.playBtn.classList.add("menu_button");
        this.playBtn.innerText = "Main Menu";
        this.playBtn.addEventListener("click",()=>{
            restartCallback(this);
        })
        this.board.append(this.playBtn);

        this.creditBtn = document.createElement("div");
        this.creditBtn.classList.add("menu_button");
        this.creditBtn.innerText = "Credits";
        this.creditBtn.addEventListener("click",()=>{
            this.board.classList.add("rotation");
            this.credBoard.classList.remove("backrotation");
        })
        this.board.append(this.creditBtn);


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

}

export default WinMenu;