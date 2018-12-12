const screen = []

for(let x = 0;x<4;x++) {
    for(let y=0;y<3;y++) {
        if(!screen[x]) screen[x]=[]
        screen[x][y] = 1
    }
}