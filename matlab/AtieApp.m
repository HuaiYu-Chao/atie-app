classdef AtieApp < handle
    properties
        figureHandle
        htmlHandle
        projections
        angles
    end
    
    methods
        function [obj] = AtieApp(env)
            arguments
                env (1, 1) string {mustBeMember(env, ["dev", "prod"])}= "prod";
            end
            
            if env == "dev"
                htmlSource = "../vite/dist/index.html";
            else
                htmlSource = "index.html";
            end
            
            obj.figureHandle = uifigure();
            obj.figureHandle.Position = [100, 100, 800, 600];
            
            obj.htmlHandle = uihtml(obj.figureHandle);
            obj.htmlHandle.Position = [1, 1, 800, 600];
            obj.htmlHandle.HTMLSource = htmlSource;
            
            obj.htmlHandle.DataChangedFcn = @(~, event) obj.showData(event);
            obj.htmlHandle.HTMLEventReceivedFcn = @(~, event) obj.handleEventFromHtml(event);
        end
        
        function reloadHtml(obj)
            source = obj.htmlHandle.HTMLSource;
            obj.htmlHandle.HTMLSource = "";
            drawnow;
            obj.htmlHandle.HTMLSource = source;
        end
        
        function showData(obj, event)
            disp(event.Data);
        end
        
        function sendEventToHtml(obj, eventName, eventData)
            sendEventToHTMLSource(obj.htmlHandle, eventName, eventData);
        end
        
        function handleEventFromHtml(obj, event)
            switch event.HTMLEventName
                case "selectAndLoadProjectionData"
                    obj.handleSelectAndLoadProjectionData();
                case "reloadHtml"
                    obj.reloadHtml();
                otherwise
                    error("Unrecognized event received from HTML.");
            end
        end
        
        function handleSelectAndLoadProjectionData(obj)
            [fileName, fileDir] = uigetfile();
            if fileName == 0
                return;
            end
            
            [~, ~, ext] = fileparts(fileName);
            if ext ~= ".mat"
                error("Unsupported data file ""%s"".", fileName);
            end
            
            data = load(fullfile(fileDir, fileName));
            obj.projections = data.projections;
            obj.angles = data.angles;
            
            eventData.projectionDataUrls = string(zeros(1, length(obj.angles)));
            for i = 1: length(obj.angles)
                eventData.projectionDataUrls(i) = ...
                    toImageDataUrl(mat2gray(obj.projections(:, :, i)));
            end
            eventData.angles = obj.angles;
            
            obj.sendEventToHtml("projectionDataLoaded", eventData);
        end
    end
end

function [result] = toImageDataUrl(img)
    tempFile = tempname();
    imwrite(img, tempFile, "png");
    
    f = fopen(tempFile, "r");
    pngData = fread(f, inf, 'uint8=>uint8');
    fclose(f);
    delete(tempFile);
    
    result = "data:image/png;base64," + matlab.net.base64encode(pngData);
end
