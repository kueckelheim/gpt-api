export class IndexController {
    public getIndex(req: any, res: any): void {
        res.render('index', { title: 'Home' });
    }
}