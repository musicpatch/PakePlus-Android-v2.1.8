window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// ========= PakePlus 原来自带的脚本（处理链接跳转）=========
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })

// ========= 新增：防华为/安卓侧滑返回脚本 =========
(function() {
    var startX = 0, isLeftEdge = false;
    var edgeWidth = window.innerWidth * 0.08; // 左边缘8%区域
    document.addEventListener('touchstart', function(e) {
        var x = e.touches[0].clientX;
        if (x <= edgeWidth) {
            isLeftEdge = true;
            startX = x;
        } else {
            isLeftEdge = false;
        }
    }, { passive: false });
    document.addEventListener('touchmove', function(e) {
        if (!isLeftEdge) return;
        var dx = e.touches[0].clientX - startX;
        if (dx > 10) { // 向右滑动超过10px即拦截
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });
    document.addEventListener('touchend', function() {
        isLeftEdge = false;
    }, { passive: false });
})();