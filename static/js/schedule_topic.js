var topic = [
    "尚未開學",
    "國定假日",
    "環境準備",
    "社團課程 1",
    "社團課程 2",
    "社團課程 3"
    ];

var startDate = new Date();
function setMonthAndDay(startMonth, startDay){
    //一次設定好月份與日期
    startDate.setMonth(startMonth-1,startDay);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
}
// setMonthAndDay(4 ,1);

