function main(env)
    arguments
        env (1, 1) string {mustBeMember(env, ["dev", "prod"])}= "prod";
    end
    
    if env == "dev"
        htmlSource = "../vite/dist/index.html";
    else
        htmlSource = "index.html";
    end
    
    f = uifigure();
    f.Position = [100, 100, 800, 600];
    
    h = uihtml(f);
    h.Position = [1, 1, 800, 600];
    h.HTMLSource = htmlSource;
end
