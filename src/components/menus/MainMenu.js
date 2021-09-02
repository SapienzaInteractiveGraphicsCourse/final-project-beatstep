

class MainMenu {

    constructor(playCallback = ()=>{}){
        
        this.backdrop = document.createElement("div");
        this.backdrop.classList.add("menu_backdrop");
        this.backdrop.classList.add("main");

        this.board = document.createElement("div");
        this.board.classList.add("menu_board");
        this.backdrop.append(this.board);

        this.boardTitle = document.createElement("div");
        this.boardTitle.classList.add("menu_title");
        this.boardTitle.innerText = "IG Final Project";
        this.board.append(this.boardTitle);

        this.playBtn = document.createElement("div");
        this.playBtn.classList.add("menu_button");
        this.playBtn.innerText = "Play";
        this.playBtn.addEventListener("click",()=>{
            playCallback();
        })
        this.board.append(this.playBtn);

        this.infoBtn = document.createElement("div");
        this.infoBtn.classList.add("menu_button");
        this.infoBtn.innerText = "How to play";
        this.infoBtn.addEventListener("click",()=>{
            
        })
        this.board.append(this.infoBtn);

        this.creditBtn = document.createElement("div");
        this.creditBtn.classList.add("menu_button");
        this.creditBtn.innerText = "Credits";
        this.creditBtn.addEventListener("click",()=>{
            
        })
        this.board.append(this.creditBtn);

        
    }

    addToPage(){
        document.body.append(this.backdrop);
    }

    removeFromPage(){
        document.body.removeChild(this.backdrop);
    }

}

export default MainMenu