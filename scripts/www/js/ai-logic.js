// ================= AI 核心逻辑（难度升级版） =================
function aiThink(data, currentPlayer, difficulty, size) {
    const emptyPoints = [];
    // 收集所有空点
    for(let i=0; i<size; i++){
        for(let j=0; j<size; j++){
            if(data[i][j] === 0) emptyPoints.push([i,j]);
        }
    }

    // 简单AI：优化为「优先连子+中心+防守」基础智能（原纯随机）
    if(difficulty === 'easy'){
        let bestScore = -1;
        let bestPoint = emptyPoints[0];
        const enemy = currentPlayer === 1 ? 2 : 1;
        
        emptyPoints.forEach(([r,c])=>{
            let score = 0;
            
            // 1. 自己连子加分（连2=5分，连3=10分）
            score += getLineScore(r,c,currentPlayer,data,size) * 3;
            
            // 2. 防守对方连子（对方连2=4分）
            score += getLineScore(r,c,enemy,data,size) * 2;
            
            // 3. 中心位置加分
            score += 10 - (Math.abs(r-7) + Math.abs(c-7));
            
            // 4. 已有棋子附近加分
            score += getNeighborScore(r,c,data,size);
            
            if(score > bestScore){
                bestScore = score;
                bestPoint = [r,c];
            }
        });
        
        return bestPoint;
    }

    // 中等AI：优化为「攻防均衡+优先冲四/堵四」（原仅中心+附近）
    if(difficulty === 'medium'){
        let bestScore = -Infinity;
        let bestPoint = emptyPoints[0];
        const enemy = currentPlayer === 1 ? 2 : 1;
        
        emptyPoints.forEach(([r,c])=>{
            let score = 0;
            
            // 1. 自己冲四（连4）= 500分，活三=100分，活二=30分
            const selfScore = getLineScore(r,c,currentPlayer,data,size);
            if(selfScore >=4) score += 500;  // 冲四
            else if(selfScore ===3) score += 100; // 活三
            else if(selfScore ===2) score += 30;  // 活二
            
            // 2. 防守对方冲四=400分，堵活三=80分
            const enemyScore = getLineScore(r,c,enemy,data,size);
            if(enemyScore >=4) score += 400;  // 堵对方冲四
            else if(enemyScore ===3) score += 80;  // 堵对方活三
            else if(enemyScore ===2) score += 20;  // 堵对方活二
            
            // 3. 中心位置额外加分
            score += 15 - (Math.abs(r-7) + Math.abs(c-7));
            
            // 4. 避免边缘位置（边缘减分）
            if(r <=1 || r >=13 || c <=1 || c >=13) score -= 10;
            
            if(score > bestScore){
                bestScore = score;
                bestPoint = [r,c];
            }
        });
        
        return bestPoint;
    }

    // 困难AI：保持「攻防兼备+优先连五/堵五」不变
    if(difficulty === 'hard'){
        let bestScore = -Infinity;
        let bestPoint = emptyPoints[0];
        const enemy = currentPlayer === 1 ? 2 : 1;
        
        emptyPoints.forEach(([r,c])=>{
            let score = 0;
            
            // 模拟自己落子得分（连五=10000，冲四=1000，活三=200）
            data[r][c] = currentPlayer;
            const selfScore = calculateDeepScore(r,c,currentPlayer,data,size);
            score += selfScore * 2;
            
            // 模拟对方落子得分（堵五=8000，堵冲四=800）
            data[r][c] = enemy;
            const enemyScore = calculateDeepScore(r,c,enemy,data,size);
            score += enemyScore;
            
            // 还原空点
            data[r][c] = 0;
            
            // 中心位置加分+边缘减分
            score += 20 - (Math.abs(r-7) + Math.abs(c-7));
            if(r <=1 || r >=13 || c <=1 || c >=13) score -= 20;
            
            if(score > bestScore){
                bestScore = score;
                bestPoint = [r,c];
            }
        });
        
        return bestPoint;
    }

    return emptyPoints[0];
}

// ================= 辅助函数：计算连子长度得分（简单/中等AI用） =================
function getLineScore(r,c,player,data,size){
    let maxCount = 0;
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    
    dirs.forEach(([dr,dc])=>{
        let count = 1;
        // 正向
        let nr = r + dr;
        let nc = c + dc;
        while(nr>=0&&nr<size&&nc>=0&&nc<size&&data[nr][nc]===player){
            count++;
            nr += dr;
            nc += dc;
        }
        // 反向
        nr = r - dr;
        nc = c - dc;
        while(nr>=0&&nr<size&&nc>=0&&nc<size&&data[nr][nc]===player){
            count++;
            nr -= dr;
            nc -= dc;
        }
        maxCount = Math.max(maxCount, count);
    });
    
    return maxCount;
}

// ================= 辅助函数：计算周围棋子得分（简单AI用） =================
function getNeighborScore(r,c,data,size){
    let score = 0;
    // 3x3范围内有棋子即加分
    for(let dr=-2; dr<=2; dr++){
        for(let dc=-2; dc<=2; dc++){
            if(dr===0 && dc===0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if(nr>=0&&nr<size&&nc>=0&&nc<size&&data[nr][nc]!==0){
                score += 2;
            }
        }
    }
    return score;
}

// ================= 辅助函数：深度得分计算（困难AI用） =================
function calculateDeepScore(r,c,player,data,size){
    let score = 0;
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    
    dirs.forEach(([dr,dc])=>{
        let count = 1;
        let block = 0;
        
        // 正向
        let nr = r + dr;
        let nc = c + dc;
        while(nr>=0&&nr<size&&nc>=0&&nc<size){
            if(data[nr][nc] === player){
                count++;
                nr += dr;
                nc += dc;
            } else if(data[nr][nc] === 0){
                break;
            } else {
                block++;
                break;
            }
        }
        
        // 反向
        nr = r - dr;
        nc = c - dc;
        while(nr>=0&&nr<size&&nc>=0&&nc<size){
            if(data[nr][nc] === player){
                count++;
                nr -= dr;
                nc -= dc;
            } else if(data[nr][nc] === 0){
                break;
            } else {
                block++;
                break;
            }
        }
        
        // 连五=10000，冲四（1个阻挡）=1000，活四（无阻挡）=5000
        if(count >=5) score += 10000;
        else if(count ===4){
            score += block ===0 ? 5000 : 1000;
        } else if(count ===3){
            score += block ===0 ? 200 : 50;
        } else if(count ===2){
            score += block ===0 ? 50 : 10;
        }
    });
    
    return score;
}
