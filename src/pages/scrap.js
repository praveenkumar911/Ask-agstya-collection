
import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, Legend, Tooltip,Line,LineChart,CartesianGrid } from 'recharts';
import { makeStyles } from '@mui/styles';
import values from './app.json'
import Button from '@mui/material/Button';
 


const useStyles = makeStyles({
  wrapText: {
    whiteSpace: 'normal !important',
    wordWrap: 'break-word !important',
  },
});


const Metrics = () => {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [filterModel, setFilterModel] = useState({ items: [] }); //
  const [todayCallData1, setTodayCallData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [lastFetchedPage, setLastFetchedPage] = useState(0);
  const [showTodayChart, setShowTodayChart] = useState(true);
  const [showLastWeekChart, setShowLastWeekChart] = useState(false);
  const [showLast14DaysChart, setShowLast14DaysChart] = useState(false);
  const [showLast1MonthChart, setShowLast1MonthChart] = useState(false);
  const [showdummychart,setDummychart]=useState(false);
  const [show8, setShow8] = useState(true);
  const [show9, setShow9] = useState(true);
  const [show10, setShow10] = useState(true);
  const [showPhysics, setShowPhysics] = useState(true);
  const [showBiology, setShowBiology] = useState(true);
  const [showCalls, setShowCalls] = useState(true);
  const[showMT,setMt]=useState(true);
  const[showAsr,setAsr]=useState(true);
  const[showTTS,setTTS]=useState(true);
  const[showDocAi,setDocAi]=useState(true);
  const[showkokoo,setKokoo]=useState(true)

  // Function to handle chart visibility
  const handleChartToggle = (chartType) => {
    setShowTodayChart(chartType === 'today');
    setShowLastWeekChart(chartType === 'lastWeek');
    setShowLast14DaysChart(chartType === 'last14Days');
    setShowLast1MonthChart(chartType === 'last1Month');
    setDummychart(chartType==='test');
  };
  const cacheBuster = Date.now();

  const fetchData = async (pageNumber, maxPages) => {
    if (fetchingData) return;

    setFetchingData(true);

    try {
      const apiUrl = `https://pl-app.iiit.ac.in/questions/answers/correct?page=${pageNumber}&size=100&rated=false&_cb=${cacheBuster}`;
      const response = await fetch(apiUrl);
      const result = await response.json();
     
      const callsByDate = {};
      if (result.items.length === 0) {
        setLoading(false);
        return;
      }
     // console.log(result.items)
     const callDataArray = [];

     result.items.forEach((call, index) => {
       const time = new Date(call.timestamp).toLocaleTimeString();
       const callData = {
         calls: (index + 1).toString(),
         date: call.timestamp,
         time,
         physics: call.subject === 'physics' ? 'yes' : 'no',
         biology: call.subject === 'biology' ? 'yes' : 'no',
         '8': call.grade === '8' ? 'yes' : 'no',
         '9': call.grade === '9' ? 'yes' : 'no',
         '10': call.grade === '10' ? 'yes' : 'no',
       };
       callDataArray.push(callData);
     });
       
     //console.log(callDataArray);
     const today1 = new Date().toISOString().slice(0, 10);

      const todayCallData1 = callDataArray.filter(call => call.date.slice(0, 10) === today1);

   // console.log("eabdjkdfb",todayCallData1);
    if (pageNumber === 1) {
      setData2(callDataArray);
    } else {
      setData2(prevData => [...prevData, ...callDataArray]);
    }

    // Filter data for today's date
    const todayDate = new Date().toISOString().slice(0, 10);
    const todayCallData = callDataArray.filter(call => call.date.slice(0, 10) === todayDate);

    if (pageNumber === 1) {
      setTodayCallData1(todayCallData);
    } else {
      setTodayCallData1(prevData => [...prevData, ...todayCallData]);
    }

    setLastFetchedPage(pageNumber);
      result.items.forEach(item => {
        const date = new Date(item.timestamp).toLocaleDateString();
        // Extract and store grade and subject information
        const grade = item.grade;
        const subject = item.subject || 'Unknown';

        if (!callsByDate[date]) {
          callsByDate[date] = { date, calls: 0 };
        }
        if (!callsByDate[date][grade]) {
          callsByDate[date][grade] = 0;
        }
        if (!callsByDate[date][subject]) {
          callsByDate[date][subject] = 0;
        }
        callsByDate[date][grade] += 1;
        callsByDate[date][subject] += 1;

        callsByDate[date].from_mobile = item.from_mobile;
        callsByDate[date].calls += 1;
      });

      const formattedData = Object.keys(callsByDate).map(date => ({
        date,
        calls: callsByDate[date].calls,
        ...callsByDate[date],
      }));

      setData(prevData => [...prevData, ...formattedData]);

      // Create data1 with the desired format of data
      const formattedData1 = result.items.reduce((prev, curr) => {
        const date = new Date(curr.timestamp).toLocaleDateString();
        const { from_mobile, ...rest } = curr;
        const mobileNum = curr.from_mobile;

        // If there is already an entry for the current date in data1, 
        // just update the call count and add the mobile number to the object
        const index = prev.findIndex((obj) => obj.date === date);
        if (index !== -1) {
          prev[index].calls += 1;
          prev[index][mobileNum] = (prev[index][mobileNum] || 0) + 1;
          Object.entries(rest).forEach(([key, value]) => {
            if (prev[index][key]) {
              prev[index][key] += 1;
            } else {
              prev[index][key] = 1;
            }
          });
        } else {
          // If there is no entry for the current date in data1, create a new object
          const newObj = { date, calls: 1, [mobileNum]: 1, ...rest };
          prev.push(newObj);
        }
        return prev;
      }, []);

      setData1(prevData => [...prevData, ...formattedData1]);

      if (pageNumber < maxPages) {
        fetchData(pageNumber + 1, maxPages);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    const maxPages = 100;
    fetchData(1, maxPages).catch(error => console.error(error));
  }, []);

  useEffect(() => {
    if (selectedDate) {
      console.log(selectedDate);
    }
  }, [selectedDate]);

  const today = 10/25/2023 //new Date().toLocaleDateString();
  
  const last14Dates = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000).toLocaleDateString();
    last14Dates.push(date);
  }

  const callsByDate = {};
  data.forEach(item => {
    const date = new Date(item.date).toLocaleDateString();
    if (callsByDate[date]) {
      callsByDate[date] += item.calls;
    } else {
      callsByDate[date] = item.calls;
    }
  });

  const last14DaysData = last14Dates.map(date => ({
    date,
    calls: callsByDate[date] || 0,
    ...(callsByDate[date] && data.find(item => item.date === date)),
  }));

  const todayData = data.filter(item => item.date === today).reduce((acc, curr) => {
    Object.keys(curr).forEach(key => {
      if (key !== 'date' && key !== 'calls') {
        if (acc[key]) {
          acc[key] += curr[key];
        } else {
          acc[key] = curr[key];
        }
      }
    });
    return acc;
  }, {});

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000).toLocaleDateString();
    last7Days.push(date);
  }
  
  
  
  const last7DaysData = last7Days.map(date => {
    const item = data.find(item => item.date === date);
    return {
      date,
      calls: item ? item.calls : 0,
      ...item,
    };
  });
  const callsByClassLast7Days = last7Days.reduce((total, date) => {
    const dateData = data.filter(item => item.date === date).reduce((acc, curr) => {
      Object.keys(curr).forEach(key => {
        if (key !== 'date' && key !== 'calls') {
          if (acc[key]) {
            acc[key] += curr[key];
          } else {
            acc[key] = curr[key];
          }
        }
      });
      return acc;
    }, {});

    Object.keys(dateData).forEach(key => {
      if (key !== 'date' && key !== 'calls') {
        if (total[key]) {
          total[key] += dateData[key];
        } else {
          total[key] = dateData[key];
        }
      }
    });
    return total;
  }, {});

  
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000).toLocaleDateString();
    last30Days.push(date);
  }
  
  const callsByDate2 = {};
  data.forEach(item => {
    const date = new Date(item.date).toLocaleDateString();
    if (last30Days.includes(date)) {
      if (callsByDate[date]) {
        callsByDate[date] += item.calls;
      } else {
        callsByDate[date] = item.calls;
      }
    }
  });
  
  const last30DaysData = last30Days.map(date => {
    const item = data.find(item => item.date === date);
    return {
      date,
      calls: item ? item.calls : 0,
      ...item,
    };
  });



  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Agsthaya Historical Metrics</h1>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
  <Button variant="contained" onClick={() => handleChartToggle('today')} style={{ marginRight: '8px' }}>Today Calls</Button>
  <Button variant="contained" onClick={() => handleChartToggle('lastWeek')} style={{ marginRight: '8px' }}>Last Week Calls</Button>
  <Button variant="contained" onClick={() => handleChartToggle('last14Days')} style={{ marginRight: '8px' }}>Last 14 Days Calls</Button>
  <Button variant="contained" onClick={() => handleChartToggle('last1Month')} style={{ marginRight: '8px' }}>Last 1 Month Calls</Button>
  <Button variant="contained" onClick={() => handleChartToggle('test')}>Internal chart</Button>
</div>
      {/* Render the line charts and checkboxes inside the same div */}
      <div style={{ display: "flex" }}>
        {/* Render the line charts */}
        {showLast14DaysChart && (
          <div style={{ marginLeft: '20px' }}>
            <h2 style={{ textAlign: 'center', marginTop: '5vh' }}>Last 2 week Calls</h2>
            <LineChart width={1500} height={500} data={last14DaysData}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend formatter={(value, entry) => (
  <span style={{ color: "black" }}>
    {value === 'physics' ? 'Physics' : 
     value === '8' ? 'Grade 8' : 
     value === '9' ? 'Grade 9' : 
     value === '10' ? 'Grade 10' : 
     value === 'calls' ? 'Kokoo' : 
     value}
  </span>
)} />
              {showCalls && <Line type="monotone" dataKey="calls" stroke="#8884d8" />}
              {show8 && <Line type="monotone" dataKey="8" stroke="#82ca9d" />}
              {show9 && <Line type="monotone" dataKey="9" stroke="#ffc658" />}
              {show10 && <Line type="monotone" dataKey="10" stroke="#000000" />}
              {showPhysics && <Line type="monotone" dataKey="physics" stroke="#8B008B" />}
              {showBiology && <Line type="monotone" dataKey="biology" stroke="#DC143C" />}
            </LineChart>
          </div>
        )}
        {showLastWeekChart && (
          <div style={{ marginLeft: '20px' }}>
            <h2 style={{ textAlign: 'center', marginTop: '5vh' }}>Last week Calls</h2>
            <LineChart width={1500} height={500} data={last7DaysData}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend formatter={(value, entry) => (
  <span style={{ color: "black" }}>
    {value === 'physics' ? 'Physics' : 
     value === '8' ? 'Grade 8' : 
     value === '9' ? 'Grade 9' : 
     value === '10' ? 'Grade 10' : 
     value === 'calls' ? 'Kokoo' : 
     value}
  </span>
)} />
              {showCalls && <Line type="monotone" dataKey="calls" stroke="#8884d8" label="Kokoo"/>}
              {show8 && <Line type="monotone" dataKey="8" stroke="#82ca9d" label="Grade 8" />}
              {show9 && <Line type="monotone" dataKey="9" stroke="#ffc658" label='Grade 9' />}
              {show10 && <Line type="monotone" dataKey="10" stroke="#000000" label='Grade 10'/>}
              {showPhysics && <Line type="monotone" dataKey="physics" stroke="#8B008B" label='Physics' />}
              {showBiology && <Line type="monotone" dataKey="biology" stroke="#DC143C" label='Biology' />}
            </LineChart>
          </div>
        )}
        {showLast1MonthChart && (
          <div style={{ marginLeft: '20px' }}>
            <h2 style={{ textAlign: 'center', marginTop: '5vh' }}>Last 1 month Calls</h2>
            <LineChart width={1500} height={500} data={last30DaysData}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend formatter={(value, entry) => (
  <span style={{ color: "black" }}>
    {value === 'physics' ? 'Physics' : 
     value === '8' ? 'Grade 8' : 
     value === '9' ? 'Grade 9' : 
     value === '10' ? 'Grade 10' : 
     value === 'calls' ? 'Kokoo' : 
     value}
  </span>
)} />
              {showCalls && <Line type="monotone" dataKey="calls" stroke="#8884d8" />}
              {show8 && <Line type="monotone" dataKey="8" stroke="#82ca9d" />}
              {show9 && <Line type="monotone" dataKey="9" stroke="#ffc658" />}
              {show10 && <Line type="monotone" dataKey="10" stroke="#000000" />}
              {showPhysics && <Line type="monotone" dataKey="physics" stroke="#8B008B" />}
              {showBiology && <Line type="monotone" dataKey="biology" stroke="#DC143C" />}
            </LineChart>
          </div>
        )}
        {showTodayChart && (
          <div style={{ marginLeft: '20px' }}>
            <h2 style={{ textAlign: 'center', marginTop: '5vh' }}>Todays Calls</h2>
            <LineChart width={1500} height={500} data={todayCallData1}>
              <XAxis dataKey="time" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend formatter={(value, entry) => (
  <span style={{ color: "black" }}>
    {value === 'physics' ? 'Physics' : 
     value === '8' ? 'Grade 8' : 
     value === '9' ? 'Grade 9' : 
     value === '10' ? 'Grade 10' : 
     value === 'calls' ? 'Kokoo' : 
     value}
  </span>
)} />
              {showCalls && <Line type="monotone" dataKey="calls" stroke="#8884d8" />}
              {show8 && <Line type="monotone" dataKey="8" stroke="#82ca9d" />}
              {show9 && <Line type="monotone" dataKey="9" stroke="#ffc658" />}
              {show10 && <Line type="monotone" dataKey="10" stroke="#000000" />}
              {showPhysics && <Line type="monotone" dataKey="physics" stroke="#8B008B" />}
              {showBiology && <Line type="monotone" dataKey="biology" stroke="#DC143C" />}
            </LineChart>
          </div>
        )}
        {showdummychart && (
          <div style={{ marginLeft: '20px' }}>
            <h2 style={{ textAlign: 'center', marginTop: '5vh' }}>Todays Calls(Asr,TTS,DOCAI)</h2>
            <LineChart width={1500} height={500} data={values}>
              <XAxis dataKey="time" />
              <YAxis /> 
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend formatter={(value, entry) => <span style={{ color: "black" }}>{value === 'physics' ? 'physics' : value}</span>} />
              {showMT && <Line type="monotone" dataKey="MT_correct" stroke="#11C7B3" />}
              {showAsr && <Line type="monotone" dataKey="Asr_correct" stroke="#EC0BE7" />}
              {showTTS && <Line type="monotone" dataKey="TTS_correct" stroke="#09F325" />}
              {showDocAi && <Line type="monotone" dataKey="DocAI_correct" stroke="#00F5FF" />}
              {showkokoo && <Line type="monotone" dataKey="kokoo" stroke="#FB8F09" />}
            </LineChart>
          </div>
        )}
    
        {/* Render checkboxes for each line */}
        {showdummychart && (
        <div style={{ marginLeft: '180px', display: 'flex', flexDirection: 'column' }}>
          <div>
            <input type="checkbox" checked={showMT} onChange={() => setMt(!showMT)} />
            <label style={{color:"#11C7B3"}}>MT</label>
          </div>
          <div>
            <input type="checkbox" checked={showAsr} onChange={() => setAsr(!showAsr)} />
            <label style={{color:"#EC0BE7"}}>Asr</label>
          </div>
          <div>
            <input type="checkbox" checked={showTTS} onChange={() => setTTS(!showTTS)} />
            <label style={{color:"#09F325"}}>TTS</label>
          </div>
          <div>
            <input type="checkbox" checked={showDocAi} onChange={() => setDocAi(!showDocAi)} />
            <label style={{color:"#00F5FF"}}>DocAi</label>
          </div>
    <div>
      <input type="checkbox" checked={showkokoo} onChange={() => setKokoo(!showkokoo)} />
      <label style={{color:"#FB8F09"}}>Kokoo</label>
    </div>
        </div>)}
        {(showLast14DaysChart || showLastWeekChart || showLast1MonthChart || showTodayChart) && (
  <div style={{ marginLeft: '180px', display: 'flex', flexDirection: 'column' }}>
    <div>
      <input type="checkbox" checked={show8} onChange={() => setShow8(!show8)} />
      <label style={{color:"#82ca9d"}}>Grade 8</label>
    </div>
    <div>
      <input type="checkbox" checked={show9} onChange={() => setShow9(!show9)} />
      <label style={{color:"#ffc658"}}>Grade 9</label>
    </div>
    <div>
      <input type="checkbox" checked={show10} onChange={() => setShow10(!show10)} />
      <label style={{color:"#000000"}}>Grade 10</label>
    </div>
    <div>
      <input type="checkbox" checked={showPhysics} onChange={() => setShowPhysics(!showPhysics)} />
      <label style={{color:"#8B008B"}}>Physics</label>
    </div>
    <div>
      <input type="checkbox" checked={showBiology} onChange={() => setShowBiology(!showBiology)} />
      <label style={{color:"#DC143C"}}>Biology</label>
    </div>
    <div>
      <input type="checkbox" checked={showCalls} onChange={() => setShowCalls(!showCalls)} />
      <label style={{color:"#8884d8"}}>Kokoo</label>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default Metrics;