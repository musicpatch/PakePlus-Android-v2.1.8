const Utils={
    // 显示遮罩弹窗
    showModal(maskId, modalId){
        document.getElementById(maskId).style.display="block";
        document.getElementById(modalId).style.display="block";
    },
    // 隐藏遮罩弹窗
    hideModal(maskId, modalId){
        document.getElementById(maskId).style.display="none";
        document.getElementById(modalId).style.display="none";
    },
    // 屏幕坐标转棋盘坐标
    screenToBoard(x,y){
        const bx=Math.round((x-GAME_STATE.cellSize)/GAME_STATE.cellSize);
        const by=Math.round((y-GAME_STATE.cellSize)/GAME_STATE.cellSize);
        return{
            x:bx,
            y:by,
            isValid:bx>=0&&bx<CONFIG.BOARD_SIZE&&by>=0&&by<CONFIG.BOARD_SIZE
        };
    },
    // 棋盘坐标转屏幕坐标
    boardToScreen(x,y){
        return{
            x:(x+1)*GAME_STATE.cellSize,
            y:(y+1)*GAME_STATE.cellSize
        };
    },
    // 自定义提示弹窗（自动关闭）
    showToast(msg){
        const t=document.getElementById("toastMask");
        const d=document.getElementById("toastModal");
        const c=d.querySelector(".toast-content");
        c.textContent=msg;
        t.style.display="block";
        d.style.display="block";
        setTimeout(()=>{
            t.style.display="none";
            d.style.display="none";
        },1600);
    },
    // 通用确认弹窗
    showConfirmModal(title, content, confirmCallback){
        const mask = document.getElementById("commonMask");
        const modal = document.getElementById("commonModal");
        const titleEl = document.getElementById("modalTitle");
        const contentEl = document.getElementById("modalContent");
        const confirmBtn = document.getElementById("modalConfirmBtn");

        titleEl.textContent = title;
        contentEl.textContent = content;
        mask.style.display = "block";
        modal.style.display = "block";

        // 绑定确认事件
        confirmBtn.onclick = ()=>{
            mask.style.display = "none";
            modal.style.display = "none";
            if(confirmCallback) confirmCallback();
        };
    }
};