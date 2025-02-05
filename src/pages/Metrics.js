
import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, Legend, Tooltip,Line,LineChart,CartesianGrid } from 'recharts';
import { makeStyles } from '@mui/styles';
import Button from '@mui/material/Button';
 
import CircularProgress from '@mui/material/CircularProgress';


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
  const[data3,setData3]=useState([])
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [filterModel, setFilterModel] = useState({ items: [] }); //

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
      const uniqueKeys = new Set(data3.map(item => item.uniqueKey));
  
      // Filter out duplicates based on unique key
      const uniqueData = result.items.filter(item => !uniqueKeys.has(item.uniqueKey));
  
      setData3((prevData) => [...prevData, ...uniqueData]);
      const callsByDate = {};
      if (result.items.length === 0) {
        setLoading(false);
        return;
      }

            
      const today = new Date().toLocaleDateString();

      const todayData = result.items.map((call) => {
        const timestamp = new Date(call.timestamp).toISOString();
        const time = new Date(call.timestamp).toLocaleTimeString();
        const date = new Date(call.timestamp).toLocaleDateString();
        
        // Check if the current call's date is equal to today's date
        if (date === today) {
          return {
            calls: 1,
            date: date,
            timestamp,
            time:time,
            from_mobile: call.from_mobile,
            physics: call.subject === 'physics' ? 1 : 0,
            biology: call.subject === 'biology' ? 1 : 0,
            '8': call.grade === '8' ? 1 : 0,
            '9': call.grade === '9' ? 1 : 0,
            '10': call.grade === '10' ? 1 : 0,
          };
        } else {
          return null; // Exclude calls from dates other than today
        }
      }).filter(Boolean); // Remove null entries

      setData2(todayData);
      
            
      const callDataArray = [];
      result.items.forEach((call, index) => {
        const timestamp = new Date(call.timestamp).toISOString();
        const time = new Date(call.timestamp).toLocaleTimeString();
        const callData = {
          calls: (index + 1).toString(),
          date: call.timestamp,
          timestamp,
          time,
          physics: call.subject === 'physics' ? 'yes' : 'no',
          biology: call.subject === 'biology' ? 'yes' : 'no',
          '8': call.grade === '8' ? 'yes' : 'no',
          '9': call.grade === '9' ? 'yes' : 'no',
          '10': call.grade === '10' ? 'yes' : 'no',
        };
        callDataArray.push(callData);
      });
  
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
      setLoading(data === 0); 
  
      // Create data1 with the desired format of data
      const formattedData1 = result.items.reduce((prev, curr) => {
        const date = new Date(curr.timestamp).toLocaleDateString();
        const timestamp = new Date(curr.timestamp).toISOString();
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
          const newObj = { date, timestamp, calls: 1, [mobileNum]: 1, ...rest };
          prev.push(newObj);
        }
        return prev;
      }, []);
  
      setData1(prevData => [...prevData, ...formattedData1]);
  
      if (pageNumber < maxPages) {
        fetchData(pageNumber + 1, maxPages);
      } else {
    
      }
    } catch (error) {
      console.error(error);
    
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

  
  
  const callsByDate = {};
  data.forEach(item => {
    const date = new Date(item.date).toLocaleDateString();
    if (callsByDate[date]) {
      callsByDate[date] += item.calls;
    } else {
      callsByDate[date] = item.calls;
    }
  });

  const last14Days = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000).toLocaleDateString();
    last14Days.push(date);
  }
  
  
  
  const last14DaysData = last14Days.map(date => {
    const item = data.find(item => item.date === date);
    return {
      date,
      calls: item ? item.calls : 0,
      ...item,
    };
  });
  

 

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
  

  
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000).toLocaleDateString();
    last30Days.push(date);
  }
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
  const currentDate = new Date().toLocaleDateString();

  // Filter out only today's data from data2
  const todayData = data.filter(item => {
    const itemDate = new Date(item.date).toLocaleDateString();
    return itemDate === currentDate;
  });
  const processData = (days) => {
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - days);

    const filteredData = data3.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= startDate && itemDate <= currentDate;
    });

    const uniqueDates = Array.from(new Set(filteredData.map(item => new Date(item.timestamp).toLocaleDateString())));

    const result = uniqueDates.map(date => {
      const entry = {
        date,
        total: 0,
      };

      if (selectedCategory === 'audio') {
        entry.audio_quality_up = 0;
        entry.audio_quality_down = 0;
        entry.audio_quality_neutral = 0;
      } else if (selectedCategory === 'asr') {
        entry.asr_rate_up = 0;
        entry.asr_rate_down = 0;
        entry.asr_rate_neutral = 0;
      } else if (selectedCategory === 'mtEng') {
        entry.mt_rate_eng_up = 0;
        entry.mt_rate_eng_down = 0;
        entry.mt_rate_eng_neutral = 0;
      } else if (selectedCategory === 'mtTel') {
        entry.mt_rate_tel_up = 0;
        entry.mt_rate_tel_down = 0;
        entry.mt_rate_tel_neutral = 0;
      } else if (selectedCategory === 'tts') {
        entry.tts_rate_up = 0;
        entry.tts_rate_down = 0;
        entry.tts_rate_neutral = 0;
      } else if (selectedCategory === 'subtl') {
        entry.subtl_up = 0;
        entry.subtl_down = 0;
        entry.subtl_neutral = 0;
      }

      return entry;
    });

    filteredData.forEach(item => {
      const date = new Date(item.timestamp).toLocaleDateString();
      const entry = result.find(entry => entry.date === date);

      if (entry) {
        if (selectedCategory === 'audio') {
          entry.audio_quality_up += item.audio_quality_rate === 'up' ? 1 : 0;
          entry.audio_quality_neutral += item.audio_quality_rate === 'neutral' ? 1 : 0;
          entry.audio_quality_down += item.audio_quality_rate === 'down' ? 1 : 0;
        } else if (selectedCategory === 'asr') {
          entry.asr_rate_up += item.asr_rate === 'up' ? 1 : 0;
          entry.asr_rate_down += item.asr_rate === 'down' ? 1 : 0;
          entry.asr_rate_neutral += item.asr_rate === 'neutral' ? 1 : 0;
        } else if (selectedCategory === 'mtEng') {
          entry.mt_rate_eng_up += item.mt_rate_eng === 'up' ? 1 : 0;
          entry.mt_rate_eng_down += item.mt_rate_eng === 'down' ? 1 : 0;
          entry.mt_rate_eng_neutral += item.mt_rate_eng === 'neutral' ? 1 : 0;
        } else if (selectedCategory === 'mtTel') {
          entry.mt_rate_tel_up += item.mt_rate_tel === 'up' ? 1 : 0;
          entry.mt_rate_tel_down += item.mt_rate_tel === 'down' ? 1 : 0;
          entry.mt_rate_tel_neutral += item.mt_rate_tel === 'neutral' ? 1 : 0;
        } else if (selectedCategory === 'tts') {
          entry.tts_rate_up += item.tts_rate === 'up' ? 1 : 0;
          entry.tts_rate_down += item.tts_rate === 'down' ? 1 : 0;
          entry.tts_rate_neutral += item.tts_rate === 'neutral' ? 1 : 0;
        } else if (selectedCategory === 'subtl') {
          entry.subtl_up += item.subtl_answer_content_rate === 'up' ? 1 : 0;
          entry.subtl_down += item.subtl_answer_content_rate === 'down' ? 1 : 0;
          entry.subtl_neutral += item.subtl_answer_content_rate === 'neutral' ? 1 : 0;
        }

        entry.total += 1;
      }
    });

    return result;
  };

  const handleCheckboxChange = (category) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const chartData = processData(30);
  const last7DaysChartData = processData(7);
  const last14DaysChartData = processData(14);

  const processData1 = (filterDate = null) => {
    const filteredData = filterDate ? data3.filter(item => new Date(item.timestamp).toLocaleDateString() === filterDate) : data3;
  
    const uniqueTimestamps = Array.from(new Set(filteredData.map(item => new Date(item.timestamp).toLocaleTimeString())));
  
    const result = uniqueTimestamps.map(time => {
      const entry = {
        time,
        count: 0,
      };
  
      if (selectedCategory === 'audio') {
        entry.audio_quality_up = 0;
        entry.audio_quality_down = 0;
        entry.audio_quality_neutral = 0;
      } else if (selectedCategory === 'asr') {
        entry.asr_rate_up = 0;
        entry.asr_rate_down = 0;
        entry.asr_rate_neutral = 0;
      } else if (selectedCategory === 'mtEng') {
        entry.mt_rate_eng_up = 0;
        entry.mt_rate_eng_down = 0;
        entry.mt_rate_eng_neutral = 0;
      } else if (selectedCategory === 'mtTel') {
        entry.mt_rate_tel_up = 0;
        entry.mt_rate_tel_down = 0;
        entry.mt_rate_tel_neutral = 0;
      } else if (selectedCategory === 'tts') {
        entry.tts_rate_up = 0;
        entry.tts_rate_down = 0;
        entry.tts_rate_neutral = 0;
      } else if (selectedCategory === 'subtl') {
        entry.subtl_up = 0;
        entry.subtl_down = 0;
        entry.subtl_neutral = 0;
      }
  
      return entry;
    });
  
    filteredData.forEach(item => {
      const time = new Date(item.timestamp).toLocaleTimeString();
      const entry = result.find(entry => entry.time === time);
  
      if (entry) {
        if (selectedCategory === 'audio') {
          entry.audio_quality_up += item.audio_quality_rate === 'up' ? 1 : 0;
          entry.audio_quality_neutral += item.audio_quality_rate === 'neutral' ? 1 : 0;
          entry.audio_quality_down += item.audio_quality_rate === 'down' ? 1 : 0;
        } else if (selectedCategory === 'asr') {
          entry.asr_rate_up += item.asr_rate === 'up' ? 1 : 0;
          entry.asr_rate_down += item.asr_rate === 'down' ? 1 : 0;
          entry.asr_rate_neutral += item.asr_rate === 'neutral' ? 1 : 0;
        } else if (selectedCategory === 'mtEng') {
          entry.mt_rate_eng_up += item.mt_rate_eng === 'up' ? 1 : 0;
          entry.mt_rate_eng_down += item.mt_rate_eng === 'down' ? 1 : 0;
          entry.mt_rate_eng_neutral += item.mt_rate_eng === 'neutral' ? 1 : 0;
        } else if (selectedCategory === 'mtTel') {
          entry.mt_rate_tel_up += item.mt_rate_tel === 'up' ? 1 : 0;
          entry.mt_rate_tel_down += item.mt_rate_tel === 'down' ? 1 : 0;
          entry.mt_rate_tel_neutral += item.mt_rate_tel === 'neutral' ? 1 : 0;
        } else if (selectedCategory === 'tts') {
          entry.tts_rate_up += item.tts_rate === 'up' ? 1 : 0;
          entry.tts_rate_down += item.tts_rate === 'down' ? 1 : 0;
          entry.tts_rate_neutral += item.tts_rate === 'neutral' ? 1 : 0;
        } else if (selectedCategory === 'subtl') {
          entry.subtl_up += item.subtl_answer_content_rate === 'up' ? 1 : 0;
          entry.subtl_down += item.subtl_answer_content_rate === 'down' ? 1 : 0;
          entry.subtl_neutral += item.subtl_answer_content_rate === 'neutral' ? 1 : 0;
        }
  
        entry.count += 1;
      }
    });
  
    return result;
  };
  
const todayChartData = processData1(new Date().toLocaleDateString());
console.log(data2);
  return (
    <div>
          {loading ? (
      <CircularProgress />
    ) : (
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
              <XAxis dataKey="date" type="category" label={{ value: 'Date', position: 'insideBottomRight', offset: -10 }} />
              <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
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
            <XAxis dataKey="date" type="category" label={{ value: 'Date', position: 'insideBottomRight', offset: -10 }} />
              <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
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
            <XAxis dataKey="date" type="category" label={{ value: 'Date', position: 'insideBottomRight', offset: -10 }} />
              <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
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
    {data2.length === 0 ? (
      <h2 style={{ textAlign: 'center', marginTop: '15vh' ,marginLeft:'40vw'}}>No calls made today &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h2>
    ) : (
      <div>
    <h2 style={{ textAlign: 'center', marginTop: '5vh' }}>Today's Calls</h2>
    <LineChart width={1500} height={500} data={data2}>
      
      <XAxis dataKey="time" type="category" label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }} />
              <YAxis label={{ value: 'time', angle: -90, position: 'insideLeft' }} />
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
      {showCalls && <Line type="monotone" dataKey="calls" stroke="#8884d8" label="Kokoo" />}
      {show8 && <Line type="monotone" dataKey="8" stroke="#82ca9d" label="Grade 8" />}
      {show9 && <Line type="monotone" dataKey="9" stroke="#ffc658" label='Grade 9' />}
      {show10 && <Line type="monotone" dataKey="10" stroke="#000000" label='Grade 10' />}
      {showPhysics && <Line type="monotone" dataKey="physics" stroke="#8B008B" />}
      {showBiology && <Line type="monotone" dataKey="biology" stroke="#DC143C" />}
    </LineChart>
    </div>
    )}

  </div>
)}
{showdummychart && (
        <div>
        <h1>Last 30 Days</h1>
        <div style={{ marginLeft: '1690px', display: 'flex', flexDirection: 'column' }}>
          <label>
            <input
              type="checkbox"
              checked={selectedCategory === 'audio'}
              onChange={() => handleCheckboxChange('audio')}
            />
            Audio
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedCategory === 'asr'}
              onChange={() => handleCheckboxChange('asr')}
            />
            ASR
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedCategory === 'mtEng'}
              onChange={() => handleCheckboxChange('mtEng')}
            />
            MT Eng
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedCategory === 'mtTel'}
              onChange={() => handleCheckboxChange('mtTel')}
            />
            MT Tel
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedCategory === 'tts'}
              onChange={() => handleCheckboxChange('tts')}
            />
            TTS
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedCategory === 'subtl'}
              onChange={() => handleCheckboxChange('subtl')}
            />
            Subtl
          </label>
        </div>
        <LineChart width={1200} height={400} data={chartData}>
          <XAxis dataKey="date" type="category" label={{ value: 'Date', position: 'insideBottomRight', offset: -10 }} />
          <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          {selectedCategory === 'audio' && (
            <>
              <Line type="monotone" dataKey="audio_quality_up" name="Audio Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="audio_quality_down" name="Audio Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="audio_quality_neutral" name="Audio Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'asr' && (
            <>
              <Line type="monotone" dataKey="asr_rate_up" name="ASR Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="asr_rate_down" name="ASR Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="asr_rate_neutral" name="ASR Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'mtEng' && (
            <>
              <Line type="monotone" dataKey="mt_rate_eng_up" name="MT Eng Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="mt_rate_eng_down" name="MT Eng Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="mt_rate_eng_neutral" name="MT Eng Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'mtTel' && (
            <>
              <Line type="monotone" dataKey="mt_rate_tel_up" name="MT Tel Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="mt_rate_tel_down" name="MT Tel Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="mt_rate_tel_neutral" name="MT Tel Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'tts' && (
            <>
              <Line type="monotone" dataKey="tts_rate_up" name="TTS Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="tts_rate_down" name="TTS Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="tts_rate_neutral" name="TTS Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'subtl' && (
            <>
              <Line type="monotone" dataKey="subtl_up" name="Subtl Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="subtl_down" name="Subtl Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="subtl_neutral" name="Subtl Neutral" stroke="#ffc658" />
            </>
          )}
          <Line type="monotone" dataKey="total" name="Total" stroke="#000000" />
        </LineChart>
        <div>
          <h1>Last 14 days data</h1>
        <LineChart width={1200} height={400} data={last14DaysChartData}>
          <XAxis dataKey="date" type="category" label={{ value: 'Date', position: 'insideBottomRight', offset: -10 }} />
          <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          {selectedCategory === 'audio' && (
            <>
              <Line type="monotone" dataKey="audio_quality_up" name="Audio Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="audio_quality_down" name="Audio Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="audio_quality_neutral" name="Audio Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'asr' && (
            <>
              <Line type="monotone" dataKey="asr_rate_up" name="ASR Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="asr_rate_down" name="ASR Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="asr_rate_neutral" name="ASR Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'mtEng' && (
            <>
              <Line type="monotone" dataKey="mt_rate_eng_up" name="MT Eng Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="mt_rate_eng_down" name="MT Eng Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="mt_rate_eng_neutral" name="MT Eng Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'mtTel' && (
            <>
              <Line type="monotone" dataKey="mt_rate_tel_up" name="MT Tel Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="mt_rate_tel_down" name="MT Tel Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="mt_rate_tel_neutral" name="MT Tel Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'tts' && (
            <>
              <Line type="monotone" dataKey="tts_rate_up" name="TTS Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="tts_rate_down" name="TTS Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="tts_rate_neutral" name="TTS Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'subtl' && (
            <>
              <Line type="monotone" dataKey="subtl_up" name="Subtl Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="subtl_down" name="Subtl Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="subtl_neutral" name="Subtl Neutral" stroke="#ffc658" />
            </>
          )}
          <Line type="monotone" dataKey="total" name="Total" stroke="#000000" />
        </LineChart>
          </div>
          <div>
          <h1>Last 7 days data</h1>
          <LineChart width={1200} height={400} data={last7DaysChartData}>
          <XAxis dataKey="date" type="category" label={{ value: 'Date', position: 'insideBottomRight', offset: -10 }} />
          <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          {selectedCategory === 'audio' && (
            <>
              <Line type="monotone" dataKey="audio_quality_up" name="Audio Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="audio_quality_down" name="Audio Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="audio_quality_neutral" name="Audio Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'asr' && (
            <>
              <Line type="monotone" dataKey="asr_rate_up" name="ASR Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="asr_rate_down" name="ASR Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="asr_rate_neutral" name="ASR Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'mtEng' && (
            <>
              <Line type="monotone" dataKey="mt_rate_eng_up" name="MT Eng Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="mt_rate_eng_down" name="MT Eng Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="mt_rate_eng_neutral" name="MT Eng Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'mtTel' && (
            <>
              <Line type="monotone" dataKey="mt_rate_tel_up" name="MT Tel Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="mt_rate_tel_down" name="MT Tel Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="mt_rate_tel_neutral" name="MT Tel Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'tts' && (
            <>
              <Line type="monotone" dataKey="tts_rate_up" name="TTS Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="tts_rate_down" name="TTS Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="tts_rate_neutral" name="TTS Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'subtl' && (
            <>
              <Line type="monotone" dataKey="subtl_up" name="Subtl Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="subtl_down" name="Subtl Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="subtl_neutral" name="Subtl Neutral" stroke="#ffc658" />
            </>
          )}
          <Line type="monotone" dataKey="total" name="Total" stroke="#000000" />
        </LineChart>
            </div>
            <h1>Today</h1>
            {todayChartData.length === 0 ? (
      <h2 style={{ textAlign: 'center', marginTop: '15vh' ,marginLeft:'1vw'}}>No calls made today</h2>
    ) : (
        <LineChart width={1200} height={400} data={todayChartData}>
          <XAxis dataKey="time" type="category" label={{ value: 'time', position: 'insideBottomRight', offset: -10 }} />
          <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          {selectedCategory === 'audio' && (
            <>
              <Line type="monotone" dataKey="audio_quality_up" name="Audio Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="audio_quality_down" name="Audio Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="audio_quality_neutral" name="Audio Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'asr' && (
            <>
              <Line type="monotone" dataKey="asr_rate_up" name="ASR Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="asr_rate_down" name="ASR Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="asr_rate_neutral" name="ASR Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'mtEng' && (
            <>
              <Line type="monotone" dataKey="mt_rate_eng_up" name="MT Eng Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="mt_rate_eng_down" name="MT Eng Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="mt_rate_eng_neutral" name="MT Eng Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'mtTel' && (
            <>
              <Line type="monotone" dataKey="mt_rate_tel_up" name="MT Tel Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="mt_rate_tel_down" name="MT Tel Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="mt_rate_tel_neutral" name="MT Tel Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'tts' && (
            <>
              <Line type="monotone" dataKey="tts_rate_up" name="TTS Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="tts_rate_down" name="TTS Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="tts_rate_neutral" name="TTS Neutral" stroke="#ffc658" />
            </>
          )}
          {selectedCategory === 'subtl' && (
            <>
              <Line type="monotone" dataKey="subtl_up" name="Subtl Up" stroke="#8884d8" />
              <Line type="monotone" dataKey="subtl_down" name="Subtl Down" stroke="#82ca9d" />
              <Line type="monotone" dataKey="subtl_neutral" name="Subtl Neutral" stroke="#ffc658" />
            </>
          )}
          <Line type="monotone" dataKey="count" name="Total" stroke="#000000" />
        </LineChart>
    )}
      </div>
        )}
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
      )}

    </div>
  );
};

export default Metrics;
