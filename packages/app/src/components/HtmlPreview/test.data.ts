export const sampleHtml = `
<!DOCTYPE html>
<html>
  <head>
    <title>Sample HTML</title>
    <script>
      console.log('Hello from iframe!');
    </script>
  </head>
  <body style="display: flex; justify-content: center; align-items: center; height: 100vh;">
    <h1>Hello World!</h1>
    <p>This is a sample HTML content.</p>
  </body>
</html>
`

export const echartsHtml = `<!DOCTYPE html>
<html lang="zh-CN">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>铠侠（Kioxia）SSD 品牌市场报告（2023年）</title>
<script
src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Noto Sans SC', sans-serif;
}

body {
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.8;
  padding: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.container {
  width: 100%;
  max-width: 750px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header {
  background: linear-gradient(135deg, #1a237e, #283593);
  color: white;
  padding: 40px 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.header::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  transform: rotate(30deg);
  animation: shine 8s infinite linear;
}

@keyframes shine {
  0% {
    transform: rotate(30deg) translate(-10%, -10%);
  }

  100% {
    transform: rotate(30deg) translate(10%, 10%);
  }
}

h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
  position: relative;
}

h2 {
  font-size: 24px;
  font-weight: 500;
  margin: 30px 0 15px;
  color: #1a237e;
  position: relative;
  padding-left: 15px;
}

h2::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 70%;
  width: 4px;
  background: linear-gradient(to bottom, #3949ab, #5c6bc0);
  border-radius: 2px;
}

.section {
  padding: 30px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  opacity: 0;
  animation: slideUp 0.5s ease-out forwards;
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section:nth-child(2) {
  animation-delay: 0.1s;
}

.section:nth-child(3) {
  animation-delay: 0.2s;
}

.section:nth-child(4) {
  animation-delay: 0.3s;
}

.section:nth-child(5) {
  animation-delay: 0.4s;
}

.section:nth-child(6) {
  animation-delay: 0.5s;
}

.highlight {
  background: linear-gradient(to right, rgba(30, 136, 229, 0.1), rgba(30, 136, 229, 0.05));
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  border-left: 4px solid #1e88e5;
}

.data-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin: 20px 0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.chart-container {
  position: relative;
  height: 300px;
  margin: 20px 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

th,
td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

th {
  background-color: #1a237e;
  color: white;
  font-weight: 500;
}

tr:nth-child(even) {
  background-color: rgba(0, 0, 0, 0.02);
}

tr:hover {
  background-color: rgba(30, 136, 229, 0.05);
}

.tag {
  display: inline-block;
  background: #e3f2fd;
  color: #1565c0;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 14px;
  margin-right: 8px;
  margin-bottom: 8px;
}

.footer {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.02);
}

@media (max-width: 768px) {
  .container {
    border-radius: 0;
    box-shadow: none;
  }

  h1 {
    font-size: 28px;
  }

  h2 {
    font-size: 22px;
  }

  .section {
    padding: 20px;
  }
}
</style>
</head>

<body>
<div class="container">
<div class="header">
  <h1>铠侠（Kioxia）SSD 品牌市场报告</h1>
  <p>2023年度分析报告</p>
</div>

<div class="section">
  <h2>1. 市场概况</h2>
  <div class="highlight">
    <p><strong>全球SSD市场规模</strong>：2023年预计达
      <strong>$45.2亿</strong>（同比增长12%），消费级与数据中心需求双驱动。
    </p>
  </div>

  <div class="data-card">
    <h3>铠侠市场地位</h3>
    <div class="chart-container">
      <canvas id="marketShareChart"></canvas>
    </div>
    <ul>
      <li>全球NAND闪存市场份额 <strong>15.8%</strong>（排名第3，仅次于三星、SK海力士）。</li>
      <li>消费级SSD销量占比 <strong>18%</strong>（主打性价比，电商渠道增长显著）。</li>
    </ul>
  </div>
</div>

<div class="section">
  <h2>2. 品牌核心数据</h2>
  <h3>2.1 产品线表现</h3>
  <div class="chart-container">
    <canvas id="productLineChart"></canvas>
  </div>
  <table>
    <thead>
      <tr>
        <th>产品系列</th>
        <th>主打特性</th>
        <th>2023年销量占比</th>
        <th>价格区间（1TB）</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>EXCERIA Pro</td>
        <td>高性能PCIe 4.0</td>
        <td>35%</td>
        <td>$90-$120</td>
      </tr>
      <tr>
        <td>EXCERIA Plus</td>
        <td>均衡性价比（PCIe 3.0）</td>
        <td>45%</td>
        <td>$60-$80</td>
      </tr>
      <tr>
        <td>BG5 OEM</td>
        <td>笔记本/数据中心</td>
        <td>20%</td>
        <td>定制报价</td>
      </tr>
    </tbody>
  </table>

  <h3>2.2 区域市场表现</h3>
  <div class="chart-container">
    <canvas id="regionChart"></canvas>
  </div>
  <ul>
    <li><strong>亚太区</strong>（占比42%）：中国、日本为主，电商大促（双11/618）销量增长30%。</li>
    <li><strong>北美区</strong>（占比33%）：亚马逊渠道占比60%，黑五促销拉动Q4销量。</li>
    <li><strong>欧洲区</strong>（占比25%）：德国、英国需求稳定，受能源危机影响增速放缓。</li>
  </ul>
</div>

<div class="section">
  <h2>3. 用户画像与竞品对比</h2>
  <h3>3.1 目标用户</h3>
  <div class="chart-container">
    <canvas id="userProfileChart"></canvas>
  </div>
  <ul>
    <li><strong>主流群体</strong>：DIY玩家、电竞用户（占比55%）。</li>
    <li><strong>次级群体</strong>：商务办公、内容创作者（30%）。</li>
    <li><strong>品牌忠诚度</strong>：复购率62%（高于行业平均50%）。</li>
  </ul>

  <h3>3.2 竞品对比（1TB PCIe 4.0 SSD）</h3>
  <table>
    <thead>
      <tr>
        <th>品牌/型号</th>
        <th>读取速度</th>
        <th>写入寿命（TBW）</th>
        <th>价格（$）</th>
        <th>京东好评率</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>铠侠 EXCERIA Pro</td>
        <td>7300MB/s</td>
        <td>600TBW</td>
        <td>95</td>
        <td>97%</td>
      </tr>
      <tr>
        <td>三星 980 Pro</td>
        <td>7000MB/s</td>
        <td>600TBW</td>
        <td>110</td>
        <td>96%</td>
      </tr>
      <tr>
        <td>西数 SN770</td>
        <td>5150MB/s</td>
        <td>600TBW</td>
        <td>85</td>
        <td>95%</td>
      </tr>
    </tbody>
  </table>

  <div class="highlight">
    <h4>优势总结</h4>
    <ul>
      <li>性能对标三星，价格低10%-15%。</li>
      <li>5年质保策略提升用户信任度。</li>
    </ul>
  </div>
</div>

<div class="section">
  <h2>4. 营销策略分析</h2>
  <h3>4.1 成功案例</h3>
  <div class="data-card">
    <div class="tag">联名营销</div>
    <p>与《原神》合作限量版SSD（销量提升25%）。</p>
  </div>
  <div class="data-card">
    <div class="tag">KOL投放</div>
    <p>B站科技区UP主测评覆盖500万+曝光。</p>
  </div>

  <h3>4.2 挑战</h3>
  <ul>
    <li><strong>品牌认知度</strong>：一线城市以外用户更倾向三星/西数。</li>
    <li><strong>供应链风险</strong>：日本工厂产能波动影响Q3交付。</li>
  </ul>
</div>

<div class="section">
  <h2>5. 未来趋势建议</h2>
  <div class="data-card">
    <div class="tag">技术方向</div>
    <p>加快PCIe 5.0产品研发（预计2024年量产）。</p>
  </div>
  <div class="data-card">
    <div class="tag">渠道下沉</div>
    <p>拓展三四线城市线下代理。</p>
  </div>
  <div class="data-card">
    <div class="tag">环保包装</div>
    <p>推出可回收材料SSD包装（响应欧盟新规）。</p>
  </div>
</div>

<div class="footer">
  <p>附录：模拟数据来源 - 销量数据：模拟IDC 2023 Q3报告 | 价格统计：亚马逊/京东2023年10月均价 |
    用户调研：虚构样本N=1000</p>
</div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
  // 市场占有率图表
  const marketShareCtx = document.getElementById('marketShareChart').getContext('2d')
  new Chart(marketShareCtx, {
    type: 'doughnut',
    data: {
      labels: ['三星', 'SK海力士', '铠侠', '其他'],
      datasets: [{
        data: [35, 25, 15.8, 24.2],
        backgroundColor: [
          '#4285F4',
          '#34A853',
          '#1A73E8',
          '#EA4335'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: '全球NAND闪存市场份额(2023)',
          font: {
            size: 16
          }
        }
      },
      cutout: '70%',
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  })

  // 产品线表现图表
  const productLineCtx = document.getElementById('productLineChart').getContext('2d')
  new Chart(productLineCtx, {
    type: 'bar',
    data: {
      labels: ['EXCERIA Pro', 'EXCERIA Plus', 'BG5 OEM'],
      datasets: [{
        label: '销量占比(%)',
        data: [35, 45, 20],
        backgroundColor: [
          'rgba(66, 133, 244, 0.7)',
          'rgba(234, 67, 53, 0.7)',
          'rgba(251, 188, 5, 0.7)'
        ],
        borderColor: [
          'rgba(66, 133, 244, 1)',
          'rgba(234, 67, 53, 1)',
          'rgba(251, 188, 5, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 50
        }
      },
      plugins: {
        title: {
          display: true,
          text: '铠侠SSD产品线销量占比(2023)',
          font: {
            size: 16
          }
        }
      },
      animation: {
        duration: 2000
      }
    }
  })

  // 区域市场表现图表
  const regionCtx = document.getElementById('regionChart').getContext('2d')
  new Chart(regionCtx, {
    type: 'pie',
    data: {
      labels: ['亚太区', '北美区', '欧洲区'],
      datasets: [{
        data: [42, 33, 25],
        backgroundColor: [
          'rgba(66, 133, 244, 0.7)',
          'rgba(234, 67, 53, 0.7)',
          'rgba(52, 168, 83, 0.7)'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: '铠侠SSD区域市场分布(2023)',
          font: {
            size: 16
          }
        }
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  })

  // 用户画像图表
  const userProfileCtx = document.getElementById('userProfileChart').getContext('2d')
  new Chart(userProfileCtx, {
    type: 'radar',
    data: {
      labels: ['DIY玩家', '电竞用户', '商务办公', '内容创作者', '品牌忠诚度'],
      datasets: [{
        label: '用户画像分布',
        data: [35, 20, 15, 15, 62],
        backgroundColor: 'rgba(66, 133, 244, 0.2)',
        borderColor: 'rgba(66, 133, 244, 1)',
        pointBackgroundColor: 'rgba(66, 133, 244, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(66, 133, 244, 1)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: {
            display: true
          },
          suggestedMin: 0,
          suggestedMax: 70
        }
      },
      plugins: {
        title: {
          display: true,
          text: '铠侠SSD用户画像分析(2023)',
          font: {
            size: 16
          }
        }
      }
    }
  })
});
</script>
</body>

</html>`
