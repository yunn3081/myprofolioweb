//Load Data
d3.csv('static/database/movies.csv').then(
    res=>{
    console.log(res);
    }
)

//Data utilities
//遇到NA就設定為undefined, 要不然就維持原本的字串
const parseNA = string => (string === 'NA' ? undefined : string);
//日期處理
const parseDate = string => d3.timeParse('%Y-%m-%d')(string);

// + 轉換成數字
function type(d){
const date = parseDate(d.release_date);
return{
    budget:+d.budget,
    genre:parseNA(d.genre),
    genres:JSON.parse(d.genres).map(d=>d.name),
    homepage:parseNA(d.homepage),
    id:+d.id,
    imdb_id:parseNA(d.imdb_id),
    original_language:parseNA(d.original_language),
    overview:parseNA(d.overview),
    popularity:+d.popularity,
    poster_path:parseNA(d.poster_path),
    production_countries:JSON.parse(d.production_countries),
    release_date:date,
    release_year:date.getFullYear(),
    revenue:+d.revenue,
    runtime:+d.runtime,
    tagline:parseNA(d.tagline),
    title:parseNA(d.title),
    vote_average:+d.vote_average,
    vote_count:+d.vote_count,
    }
}

//Data selection
function filterData(data){
    return data.filter(
    d => {
        return(
            d.release_year > 1999 && d.release_year < 2010 &&
            d.revenue > 0 &&
            d.budget > 0 &&
            d.genre &&
            d.title
            );
        }
    );
}

function prepareBarChartData(data){
    console.log(data);
    const dataMap = d3.rollup(
        data,
        v => d3.sum(v, leaf => leaf.revenue), //將revenue加總
        d => d.genre //依電影分類groupby
    );
    const dataArray = Array.from(dataMap, d=>({genre:d[0], revenue:d[1]}));
    return dataArray;
}

function prepareScatterData(data){
    return data.sort((a,b)=>b.budget-a.budget).filter((d,i)=>i<100);
}

//Main
function ready(movies){
    const moviesClean = filterData(movies);
    const barChartData = prepareBarChartData(moviesClean).sort(
        (a,b)=>{
            return d3.descending(a.revenue, b.revenue);
        }
    );
    console.log(barChartData);
    //Get Top 15 revenue movies
    const revenueData = chooseData("revenue",moviesClean);
    setupCanvas(revenueData, moviesClean);
    // setupCanvasBar(barChartData);

    const scatterData = prepareScatterData(moviesClean);
    console.log(scatterData);
    setupCanvasScatter(scatterData);
}

//Load Data
d3.csv('static/database/movies.csv',type).then(
    res=>{
        ready(res);
        //console.log(res);
    }
)

function chooseData(metric, movieClean){
    const thisData = movieClean.sort((a,b)=>b[metric]-a[metric]).filter((d,i)=>i<15);
    return thisData;
}

function setupCanvas(barChartData, moviesClean){
    //一開始預設指標是revenue
    let metric = 'budget';
    function click(){
        metric = this.dataset.name;
        const thisData = chooseData(metric, moviesClean);
        update(thisData);
    }

    d3.selectAll('button').on('click',click);

    function update(data){
        console.log(data);
        //Update Scale
        xMax = d3.max(data, d=>d[metric]);
        xScale_v3 = d3.scaleLinear([0, xMax],[0,barchart_width]);
        yScale = d3.scaleBand().domain(data.map(d=>d.title))
        .rangeRound([0, barchart_height])
        .paddingInner(0.25);
        //Transition Settings
        const defaultDelay = 1000
        const transitionDelay = d3.transition().duration(defaultDelay);
        //Update axis
        xAxisDraw.transition(transitionDelay).call(xAxis.scale(xScale_v3));
        yAxisDraw.transition(transitionDelay).call(yAxis.scale(yScale));
        //Update Header
        header.select('tspan').text(`Top 15 ${metric} movies ${metric==='popularity'?'':'in $US'}`);
        //Update Bar
        bars.selectAll('.bar').data(data, d=>d.title).join(
            enter =>{
                enter.append('rect').attr('class','bar')
                .attr('x',0).attr('y',d=>yScale(d.title))
                .attr('height',yScale.bandwidth())
                .style('fill','lightcyan')
                .transition(transitionDelay)
                .delay((d,i)=>i*20)
                .attr('width',d=>xScale_v3(d[metric]))
                .style('fill','#B7CADB')
            },
            update => {
                update.transition(transitionDelay)
                        .delay((d,i)=>i*20)
                        .attr('y',d=>yScale(d.title))
                        .attr('width',d=>xScale_v3(d[metric]))
            },
            exit => {
                exit.transition().duration(defaultDelay/2)
                    .style('fill-opacity',0)
                    .remove()
            }
        );
        //interactive 新增監聽
        d3.selectAll('.bar')
        .on('mouseover',mouseover)
        .on('mousemove',mousemove)
        .on('mouseout',mouseout);
    }
    const svg_width = 700;
    const svg_height = 500;
    const barchart_margin = {top:80,right:80,bottom:40,left:250};
    const barchart_width = svg_width - (barchart_margin.left + barchart_margin.right);
    const barchart_height = svg_height - (barchart_margin.top + barchart_margin.bottom);
    const this_svg = d3.select('.bar-chart-container').append('svg')
    .attr('width', svg_width).attr('height',svg_height)
    .append('g')
    .attr('transform',`translate(${barchart_margin.left},${barchart_margin.top})`);
    //scale
    //V1.d3.extent find the max & min in revenue
    const xExtent = d3.extent(barChartData, d=>d.revenue);
    const xScale_v1 = d3.scaleLinear().domain(xExtent).range([0,barchart_width]);
    //V2.0 ~ max
    let xMax = d3.max(barChartData, d=>d.revenue);
    const xScale_v2 = d3.scaleLinear().domain([0, xMax]).range([0,barchart_width]);
    //V3.Short writing for v2
    let xScale_v3 = d3.scaleLinear([0,xMax],[0, barchart_width]);
    //垂直空間的分配 - 平均分布給各種類
    // const yScale = d3.scaleBand().domain(barChartData.map(d=>d.genre))
    // .rangeRound([0, barchart_height])
    // .paddingInner(0.25);
    //垂直空間的分配 - 平均分布給Top 15
    let yScale = d3.scaleBand().domain(barChartData.map(d=>d.title))
    .rangeRound([0, barchart_height])
    .paddingInner(0.25);
    const bars = this_svg.append('g').attr('class','bars');
    //Draw header
    let header = this_svg.append('g').attr('class','bar-header')
    .attr('transform',`translate(0,${-barchart_margin.top/2})`)
    .append('text');
    //header.append('tspan').text('Total revenue by genre in $US');
    header.append('tspan').text('Top 15 XXX movies');
    header.append('tspan').text('Years:2000-2009')
    .attr('x',0).attr('y',20).style('font-size','0.8em').style('fill','#555');
    //tickSizeInner : the length of the tick lines
    //tickSizeOuter : the length of the square ends of the domain path
    let xAxis = d3.axisTop(xScale_v3).ticks(5).tickFormat(formatTicks)
    .tickSizeInner(-barchart_height).tickSizeOuter(0);
    //this_svg.append('g').attr('class','x axis').call(xAxis);
    let xAxisDraw = this_svg.append('g').attr('class','x axis');
    //tickSize : set tickSizeInner & Outer
    let yAxis = d3.axisLeft(yScale).tickSize(0);
    //const yAxisDraw = this_svg.append('g').attr('class','y axis').call(yAxis);
    let yAxisDraw = this_svg.append('g').attr('class','y axis');
    yAxisDraw.selectAll('text').attr('dx','-0.6em');
    update(barChartData);

    //interactive 互動處理
    const tip = d3.select('.tooltip');
    function mouseover(e){
        tip.style('left',e.clientX+'px')
        .style('top',e.clientY+'px')
        .style('opacity',0.98)
        .html("Hello")
    }
    function mouseover(e){
        //get data
        const thisBarData = d3.select(this).data()[0];
        const bodyData = [
            ['Budget', thisBarData.budget],
            ['Revenue', thisBarData.revenue],
            ['Profit', thisBarData.revenue - thisBarData.budget],
            ['TMDB Popularity', Math.round(thisBarData.popularity)],
            ['IMDB Rating', thisBarData.vote_average],
            ['Genres', thisBarData.genres.join(', ')]
        ];

        tip.style('left',(e.clientX+15)+'px')
        .style('top',e.clientY+'px')
        .transition()
        .style('opacity',0.98);

        tip.select('h3').html(`${thisBarData.title}, ${thisBarData.release_year}`);
        tip.select('h4').html(`${thisBarData.tagline}, ${thisBarData.runtime} min.`);

        d3.select('.tip-body').selectAll('p').data(bodyData)
        .join('p').attr('class', 'tip-info')
        .html(d=>`${d[0]} : ${d[1]}`);
    }
    function mousemove(e){
        tip.style('left',(e.clientX+15)+'px')
        .style('top',e.clientY+'px');
    }
    function mouseout(e){
        tip.transition()
            .style('opacity',0)
    }
    //interactive 新增監聽
    d3.selectAll('.bar')
        .on('mouseover',mouseover)
        .on('mousemove',mousemove)
        .on('mouseout',mouseout);

    function formatTicks(d){
        return d3.format('.2s')(d)
        .replace('M',' mil').replace('G',' bil').replace('T',' tri')
    }
    const bodyData = [
        ['Budget', formatTicks(thisBarData.budget)],
        ['Revenue', formatTicks(thisBarData.revenue)],
        ['Profit', formatTicks(thisBarData.revenue - thisBarData.budget)],
        ['TMDB Popularity', Math.round(thisBarData.popularity)],
        ['IMDB Rating', thisBarData.vote_average],
        ['Genres', thisBarData.genres.join(', ')]
    ];
}



function setupCanvasBar(barChartData){
    const svg_width = 400;
    const svg_height = 500;
    const chart_margin = {top:80,right:40,bottom:40,left:80};
    const chart_width = svg_width - (chart_margin.left + chart_margin.right);
    const chart_height = svg_height - (chart_margin.top + chart_margin.bottom);
    const this_svg = d3.select('.bar-chart-container').append('svg')
    .attr('width', svg_width).attr('height',svg_height)
    .append('g')
    .attr('transform',`translate(${chart_margin.left},${chart_margin.top})`);
    //scale
    //V1.d3.extent find the max & min in revenue
    const xExtent = d3.extent(barChartData, d=>d.revenue);
    const xScale_v1 = d3.scaleLinear().domain(xExtent).range([0,chart_width]);
    //V2.0 ~ max
    const xMax = d3.max(barChartData, d=>d.revenue);
    const xScale_v2 = d3.scaleLinear().domain([0, xMax]).range([0,chart_width]);
    //V3.Short writing for v2
    const xScale_v3 = d3.scaleLinear([0,xMax],[0, chart_width]);
    //垂直空間的分配 - 平均分布給各種類
    const yScale = d3.scaleBand().domain(barChartData.map(d=>d.genre))
    .rangeRound([0, chart_height])
    .paddingInner(0.25);

    //Draw bars
    const bars = this_svg.selectAll('.bar')
    .data(barChartData)
    .enter()
    .append('rect')
    .attr('class','bar')
    .attr('x',0)
    .attr('y',d=>yScale(d.genre))
    .attr('width',d=>xScale_v3(d.revenue))
    .attr('height',yScale.bandwidth())
    .style('fill', '#DAB88B')

    //Draw header
    const header = this_svg.append('g').attr('class','bar-header')
    .attr('transform',`translate(0,${-chart_margin.top/2})`)
    .append('text');
    header.append('tspan').text('Total revenue by genre in $US');
    header.append('tspan').text('Years:2000-2009')
    .attr('x',0).attr('y',20).style('font-size','0.8em').style('fill','#555');

    //tickSizeInner : the length of the tick lines
    //tickSizeOuter : the length of the square ends of the domain path
    const xAxis = d3.axisTop(xScale_v3)
    .tickFormat(formatTicks)
    .tickSizeInner(-chart_height)
    .tickSizeOuter(0);
    const xAxisDraw = this_svg.append('g')
        .attr('class','x axis')
        .call(xAxis);
    const yAxis = d3.axisLeft(yScale).tickSize(0);
    const yAxisDraw = this_svg.append('g')
        .attr('class','y axis')
        .call(yAxis);
    yAxisDraw.selectAll('text').attr('dx','-0.6em');
}

function formatTicks(d){
    return d3.format('~s')(d)
    .replace('M','mil')
    .replace('G','bil')
    .replace('T','tri')
}

function setupCanvasScatter(scatterData){
    const svg_width = 500;
    const svg_height = 500;
    const chart_margin = {top:80,right:40,bottom:40,left:80};
    const chart_width = svg_width - (chart_margin.left + chart_margin.right);
    const chart_height = svg_height - (chart_margin.top + chart_margin.bottom);

    //Draw Scatter Base
    const this_svg = d3.select('.scatter-plot-container').append('svg')
    .attr('width', svg_width).attr('height',svg_height)
    .append('g')
    .attr('transform',`translate(${chart_margin.left},${chart_margin.top})`);

    //scale
    //d3.extent find the max & min in budget
    const xExtent = d3.extent(scatterData, d=>d.budget);
    const xScale = d3.scaleLinear().domain(xExtent).range([0,chart_width]);
    //垂直空間的分配 - 平均分布給各種類
    const yExtent = d3.extent(scatterData, d=>d.revenue)
    const yScale = d3.scaleLinear().domain(yExtent).range([chart_height,0]);//營收最小的放最下方，與座標相反

    //Draw Scatters
    this_svg.selectAll('.scatter').data(scatterData).enter()
    .append('circle')
    .attr('class','scatter')
    .attr('cx',d=>xScale(d.budget))
    .attr('cy',d=>yScale(d.revenue))
    .attr('r',3)
    .style('fill', '#B7CADB')
    .style('fill-opacity',0.5); 

    //Draw header
    const header = this_svg.append('g').attr('class','bar-header')
    .attr('transform',`translate(0,${-chart_margin.top/2})`)
    .append('text');
    header.append('tspan').text('Budget vs. Revenue in $US');
    header.append('tspan').text('Top 100 films by budget, 2000-2009')
    .attr('x',0).attr('y',20).style('font-size','0.8em').style('fill','#555');

    //ticks 決定約略有幾個刻度(依數值狀況)
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(formatTicks)
    .tickSizeInner(-chart_height).tickSizeOuter(0);
    const xAxisDraw = this_svg.append('g').attr('class','x axis')
    .attr('transform',`translate(-10,${chart_height+10})`)
    .call(xAxis)
    .call(addLabel,'Budget',25,0);

    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(formatTicks)
    .tickSizeInner(-chart_height).tickSizeOuter(0);
    const yAxisDraw = this_svg.append('g').attr('class','y axis')
    .attr('transform',`translate(-10,10)`)
    .call(yAxis)
    .call(addLabel,'Revenue',-30,-30);
    //拉開字與軸的距離
    xAxisDraw.selectAll('text').attr('dy','2em');
}

function addLabel(axis, label, x, y){
    /* axis 是呼叫者 - 哪一個軸 */
    axis.selectAll('.tick:last-of-type text')
    .clone()
    .text(label)
    .attr('x',x)
    .attr('y',y)
    .style('text-anchor','start')
    .style('font-weight','bold')
    .style('fill','#555');
}
