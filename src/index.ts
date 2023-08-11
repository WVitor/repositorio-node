import { NextFunction, Request, Response } from "express";
const express = require('express');
const app = express();
const fs = require('fs');
const pdf = require('pdf-parse')

interface ObjetctDirs{
    src: string,
    url: string
}

app.engine("handlebars", require("express-handlebars").engine());
app.set("view engine", "handlebars");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction)=>{ 
    res.locals.logado = true 
    next()
}) 

app.get("/files/*", async(req: Request, res: Response) => {
    const src = decodeURIComponent(req.url).replace('/files/', '')
    if(src.endsWith('.pdf')){
        res.setHeader('Content-Length', fs.statSync(`./files/${src}`).size);
        res.setHeader('Content-Type', 'application/pdf');
        fs.createReadStream(`./files/${src}`).pipe(res);
        return
    }else{
        const dirs : ObjetctDirs[] = []
        fs.readdirSync(`./files/${src}`).forEach((file: string)=>{
            dirs.push({src: file, url: `${src}/${file}`})
        })
        res.render('pages/repositorio', {dirs});
    }
})

app.get("/api/files/*", async(req: Request, res: Response) => {
    const src = decodeURIComponent(req.url).replace('/api/files/', '')
    console.log(src)
    if(src.endsWith('.pdf')){
        const fileBuffer = await fs.readFileSync(`./files/${src}`)
        try {
            await pdf(fileBuffer).then((data: any) => {
                //console.log(data.numpages)
                //console.log(data.numrender)
                console.log(data.info)
                console.log(data.metadata._metadata)
                //console.log(data.text)
                //console.log(data.version)
                res.status(200).json(data)
            })
        } catch (error) {
            res.status(500).json({error: error})
        }
    }else{
        res.status(500).json({error: 'Arquivo não é um PDF'})
    }
})

app.get('/', (req: Request, res: Response) => {
    const dirs : ObjetctDirs[] = []
    fs.readdirSync(`./files`).forEach((file: string)=>{
        dirs.push({src: file, url: file})
    })
    res.render('pages/repositorio', {dirs});
})

app.listen(3000, () => {console.log('Server is running on port 3000')})