const P2P = require('pipe2pam')
const PamDiff = require('pam-diff')
module.exports = function(jsonData,pamDiffResponder){
    const noiseFilterArray = {};
    const config = jsonData.globalInfo.config
    const completeMonitorConfig = jsonData.rawMonitorConfig
    const groupKey = completeMonitorConfig.ke
    const monitorId = completeMonitorConfig.mid
    const monitorDetails = completeMonitorConfig.details
    const triggerTimer = {}
    let regionJson
    try{
        regionJson = JSON.parse(monitorDetails.cords)
    }catch(err){
        regionJson = monitorDetails.cords
    }
    let fullFrame = null
    const pamDetectorIsEnabled = monitorDetails.detector_pam === '1'
    const width = parseInt(monitorDetails.detector_scale_x) || 640
    const height = parseInt(monitorDetails.detector_scale_y) || 480
    const globalSensitivity = parseInt(monitorDetails.detector_sensitivity) || 10
    const globalMaxSensitivity = parseInt(monitorDetails.detector_max_sensitivity) || 100
    const globalColorThreshold = parseInt(monitorDetails.detector_color_threshold) || 9
    const globalThreshold = parseInt(monitorDetails.detector_threshold) || 1
    const detectorFrameRate = parseInt(monitorDetails.detector_fps) || 2
    const regionsAreMasks = monitorDetails.detector_frame !== '1' && monitorDetails.inverse_trigger === '1';
    const regionConfidenceMinimums = {}
    const regionConfidenceMaximums = {}
    const regionTriggerThresholds = {}
    const mergeTriggers = config.detectorMergePamRegionTriggers
    if(Object.keys(regionJson).length === 0 || monitorDetails.detector_frame === '1'){
        fullFrame = {
            name:'FULL_FRAME',
            sensitivity: globalSensitivity,
            color_threshold: globalColorThreshold,
            points:[
                [0,0],
                [0,height],
                [width,height],
                [width,0]
            ]
        }
    }
    const mask = {
        name: 'theMask',
        max_sensitivity : globalSensitivity,
        threshold : globalThreshold,
    }
    const regions = createPamDiffRegionArray(regionJson,globalColorThreshold,globalSensitivity,fullFrame)
    const pamDiffOptions = {
        mask: regionsAreMasks,
        grayscale: 'luminosity',
        regions : regions.forPam,
        percent : config.sendDetectionDataWithoutTrigger ? 1 : globalSensitivity,
        difference : globalColorThreshold,
        response: "blobs",
    }
    const pamDiff = new PamDiff(pamDiffOptions)
    const p2p = new P2P()
    Object.values(regionJson).forEach(function(region){
        regionConfidenceMinimums[region.name] = parseInt(region.sensitivity) || globalSensitivity;
        regionConfidenceMaximums[region.name] = parseInt(region.max_sensitivity) || globalMaxSensitivity;
        regionTriggerThresholds[region.name] = parseInt(region.threshold) || globalThreshold;
    })
    Object.keys(regions.notForPam).forEach(function(name){
        if(!noiseFilterArray[name])noiseFilterArray[name] = []
    })
    if(typeof pamDiffResponder === 'function'){
      var sendDetectedData = function(detectorObject){
        pamDiffResponder(detectorObject)
      }
    }else{
      var sendDetectedData = function(detectorObject){
        pamDiffResponder.write(Buffer.from(JSON.stringify(detectorObject)))
      }
    }
    function logData(...args){
        process.logData(JSON.stringify(args))
    }
    function getRegionsWithMinimumChange(data){
        try{
            var acceptedTriggers = []
            data.forEach((trigger) => {
                if(trigger.percent > regionConfidenceMinimums[trigger.name]){
                    acceptedTriggers.push(trigger)
                }
            })
            return acceptedTriggers
        }catch(err){
            return []
            // process.logData(err.stack)
        }
    }
    function getRegionsBelowMaximumChange(data){
        try{
            var acceptedTriggers = []
            data.forEach((trigger) => {
                if(trigger.percent < regionConfidenceMaximums[trigger.name]){
                    acceptedTriggers.push(trigger)
                }
            })
            return acceptedTriggers
        }catch(err){
            return []
            // process.logData(err.stack)
        }
    }
    function getRegionsWithThresholdMet(data){
        try{
            var acceptedTriggers = []
            data.forEach((trigger) => {
                if(checkTriggerThreshold(trigger.name)){
                    acceptedTriggers.push(trigger)
                }
            })
            return acceptedTriggers
        }catch(err){
            return []
            // process.logData(err.stack)
        }
    }
    function buildDetectorObject(trigger){
        return {
            f: 'trigger',
            id: monitorId,
            ke: groupKey,
            name: trigger.name,
            details: {
                plug:'built-in',
                name: trigger.name,
                reason: 'motion',
                confidence:trigger.percent,
                matrices: trigger.matrices.filter(matrix => !!matrix),
                imgHeight: monitorDetails.detector_scale_y,
                imgWidth: monitorDetails.detector_scale_x
            }
        }
    }
    function filterTheNoise(trigger,callback){
        if(noiseFilterArray[trigger.name].length > 2){
            var thePreviousTriggerPercent = noiseFilterArray[trigger.name][noiseFilterArray[trigger.name].length - 1];
            var triggerDifference = trigger.percent - thePreviousTriggerPercent;
            var noiseRange = monitorDetails.detector_noise_filter_range
            if(!noiseRange || noiseRange === ''){
                noiseRange = 6
            }
            noiseRange = parseFloat(noiseRange)
            if(((trigger.percent - thePreviousTriggerPercent) < noiseRange)||(thePreviousTriggerPercent - trigger.percent) > -noiseRange){
                noiseFilterArray[trigger.name].push(trigger.percent);
            }
        }else{
            noiseFilterArray[trigger.name].push(trigger.percent);
        }
        if(noiseFilterArray[trigger.name].length > 10){
            noiseFilterArray[trigger.name] = noiseFilterArray[trigger.name].splice(1,10)
        }
        var theNoise = 0;
        noiseFilterArray[trigger.name].forEach(function(v,n){
            theNoise += v;
        })
        theNoise = theNoise / noiseFilterArray[trigger.name].length;
        var triggerPercentWithoutNoise = trigger.percent - theNoise;
        if(triggerPercentWithoutNoise > regions.notForPam[trigger.name].sensitivity){
            callback(null,trigger)
        }else{
            callback(true)
        }
    }
    function filterTheNoiseFromMultipleRegions(acceptedTriggers){
        return new Promise((resolve,reject) => {
            let filteredCount = 0
            let filteredCountSuccess = 0
            acceptedTriggers.forEach(function(trigger,n){
                filterTheNoise(trigger,function(err){
                    ++filteredCount
                    if(!err)++filteredCountSuccess
                    if(filteredCount === acceptedTriggers.length && filteredCountSuccess > 0){
                        resolve(true)
                    }else if(acceptedTriggers.length === n + 1){
                        resolve(false)
                    }
                })
            })
        })
    }
    function getAcceptedTriggers(data){
        return getRegionsWithThresholdMet(
            getRegionsBelowMaximumChange(
                getRegionsWithMinimumChange(data)
            )
        )
    }
    function buildTriggerEvent(data){
        const detectorObject = buildDetectorObject(data)
        sendDetectedData(detectorObject)
    }
    function attachPamPipeDrivers(cameraProcess,onEvent){
        let pamAnalyzer = function(){}
        if(typeof onEvent === 'function'){
            pamAnalyzer = onEvent
        }else{
            if(mergeTriggers === true){
                // merge pam triggers for performance boost
                if(monitorDetails.detector_noise_filter === '1'){
                    pamAnalyzer = async (data) => {
                        const acceptedTriggers = getAcceptedTriggers(data.trigger)
                        const passedFilter = await filterTheNoiseFromMultipleRegions(acceptedTriggers)
                        if(passedFilter)buildTriggerEvent(mergePamTriggers(acceptedTriggers))
                    }
                }else{
                    pamAnalyzer = (data) => {
                        const acceptedTriggers = getAcceptedTriggers(data.trigger)
                        // logData(acceptedTriggers)
                        buildTriggerEvent(mergePamTriggers(acceptedTriggers))
                    }
                }
            }else{
                //config.detectorMergePamRegionTriggers NOT true
                //original behaviour, all regions have their own event.
                if(monitorDetails.detector_noise_filter === '1'){
                    pamAnalyzer = (data) => {
                        getAcceptedTriggers(data.trigger).forEach(function(trigger){
                            filterTheNoise(trigger,function(){
                                createMatricesFromBlobs(trigger)
                                buildTriggerEvent(trigger)
                            })
                        })
                    }
                }else{
                    pamAnalyzer = (data) => {
                        getAcceptedTriggers(data.trigger).forEach(function(trigger){
                            createMatricesFromBlobs(trigger)
                            buildTriggerEvent(trigger)
                        })
                    }
                }
            }
        }
        pamDiff.on('diff',pamAnalyzer)
        cameraProcess.stdio[3].pipe(p2p).pipe(pamDiff)
    }
    function createPamDiffRegionArray(regions,globalColorThreshold,globalSensitivity,fullFrame){
        var pamDiffCompliantArray = [],
            arrayForOtherStuff = [],
            json
        try{
            json = JSON.parse(regions)
        }catch(err){
            json = regions
        }
        if(fullFrame){
            json[fullFrame.name] = fullFrame
        }
        Object.values(json).forEach(function(region){
            if(!region)return false;
            region.polygon = [];
            region.points.forEach(function(points){
                var x = parseFloat(points[0]);
                var y = parseFloat(points[1]);
                if(x < 0)x = 0;
                if(y < 0)y = 0;
                region.polygon.push({
                    x: x,
                    y: y
                })
            })
            if(region.sensitivity===''){
                region.sensitivity = globalSensitivity
            }else{
                region.sensitivity = parseInt(region.sensitivity)
            }
            if(region.color_threshold===''){
                region.color_threshold = globalColorThreshold
            }else{
                region.color_threshold = parseInt(region.color_threshold)
            }
            pamDiffCompliantArray.push({name: region.name, difference: region.color_threshold, percent: region.sensitivity, polygon:region.polygon})
            arrayForOtherStuff[region.name] = region;
        })
        if(pamDiffCompliantArray.length === 0)pamDiffCompliantArray = null;
        return {forPam:pamDiffCompliantArray,notForPam:arrayForOtherStuff};
    }
    function checkTriggerThreshold(triggerLabel){
        const threshold = regionTriggerThresholds[triggerLabel] || globalThreshold
        if (threshold <= 1) {
            return true
        } else {
            if (triggerTimer[triggerLabel] === undefined) {
                triggerTimer[triggerLabel] = {
                    count : threshold,
                    timeout : null
                }
            }
            const theTriggerTimerInfo = triggerTimer[triggerLabel]
            if (--theTriggerTimerInfo.count == 0) {
                clearTimeout(theTriggerTimerInfo.timeout)
                theTriggerTimerInfo = undefined
                return true
            } else {
                if (theTriggerTimerInfo.timeout !== null){
                    clearTimeout(theTriggerTimerInfo.timeout)
                }
                theTriggerTimerInfo.timeout = setTimeout(function() {
                    triggerTimer[triggerLabel] = undefined
                }, ((threshold+0.5) * 1000) / detectorFrameRate)
                return false
            }
        }
    }
    function mergePamTriggers(acceptedTriggers){
        var n = 0
        var sum = 0
        var matrices = []
        acceptedTriggers.forEach(function(trigger){
            ++n
            sum += trigger.percent
            createMatricesFromBlobs(trigger)
            if(trigger.matrices)matrices.push(...trigger.matrices)
        })
        var average = sum / n
        if(matrices === null)matrices = []
        var trigger = {
            name: `multipleRegions`,
            percent: parseInt(average),
            matrices: matrices,
            acceptedTriggers: acceptedTriggers
        }
        return trigger
    }
    function getPropertiesFromBlob(data){
        const coordinates = [
            {"x" : data.minX, "y" : data.minY},
            {"x" : data.maxX, "y" : data.minY},
            {"x" : data.maxX, "y" : data.maxY}
        ]
        return {
            confidence: data.percent,
            width: Math.sqrt( Math.pow(coordinates[1].x - coordinates[0].x, 2) + Math.pow(coordinates[1].y - coordinates[0].y, 2)),
            height: Math.sqrt( Math.pow(coordinates[2].x - coordinates[1].x, 2) + Math.pow(coordinates[2].y - coordinates[1].y, 2)),
            x: coordinates[0].x,
            y: coordinates[0].y,
        }
    }
    function createMatricesFromBlobs(trigger){
        trigger.matrices = []
        trigger.blobs.forEach(function(blob){
            const blobProperties = getPropertiesFromBlob(blob)
            blobProperties.tag = trigger.name
            trigger.matrices.push(blobProperties)
        })
        return trigger
    }
    return {
        //functions
        getRegionsWithMinimumChange,
        getRegionsBelowMaximumChange,
        getRegionsWithThresholdMet,
        buildDetectorObject,
        filterTheNoise,
        filterTheNoiseFromMultipleRegions,
        getAcceptedTriggers,
        sendDetectedData,
        buildTriggerEvent,
        attachPamPipeDrivers,
        createPamDiffRegionArray,
        checkTriggerThreshold,
        mergePamTriggers,
        getPropertiesFromBlob,
        createMatricesFromBlobs,
        logData,
        // parameters
        pamDetectorIsEnabled,
        noiseFilterArray,
        config,
        completeMonitorConfig,
        groupKey,
        monitorId,
        monitorDetails,
        triggerTimer,
        regionJson,
        width,
        height,
        globalSensitivity,
        globalMaxSensitivity,
        globalColorThreshold,
        globalThreshold,
        detectorFrameRate,
        regionsAreMasks,
        regionConfidenceMinimums,
        regionConfidenceMaximums,
        regionTriggerThresholds,
        mergeTriggers,
    }
}
