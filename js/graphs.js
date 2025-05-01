function drawAuditRatioGraph(data) {

    // SVG setup
    const svg = document.getElementById('graph1');
    svg.innerHTML = ''; // Clear existing content

    // Define original dimensions for viewBox
    const originalWidth = 600;
    const originalHeight = 400;
    svg.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'); // Maintain aspect ratio

    // Get actual dimensions of SVG
    const { width: actualWidth } = svg.getBoundingClientRect();
    const scaleFactor = actualWidth / originalWidth; // Scale based on actual width
    const width = originalWidth;
    const height = originalHeight;

    // Adjust margins based on scale
    const margin = {
        top: 20 * scaleFactor,
        right: 30 * scaleFactor,
        bottom: 50 * scaleFactor,
        left: 50 * scaleFactor
    };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Add SVG background
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('fill', '#f5f5ff'); // Light gray background (modify as needed)
    svg.appendChild(bgRect);

    // Group for graph content
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    svg.appendChild(g);

    // Process data: Calculate cumulative audit ratio for each transaction
    var transactions = data.transaction;

    transactions = transactions.reduce((acc, curr) => {
        const existing = acc.find(item => item.path === curr.path && item.type === curr.type);

        if (existing) {
            existing.amount += curr.amount;
            existing.createdAt = new Date(curr.createdAt) > new Date(existing.createdAt)
                ? curr.createdAt
                : existing.createdAt;
        } else {
            acc.push({ ...curr });
        }
        return acc;
    }, []);

    transactions = transactions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let totalUp = 0, totalDown = 0;
    const dataPoints = transactions.map(t => {
        if (t.type === 'up') totalUp += t.amount;
        else totalDown += t.amount;
        const ratio = totalDown !== 0 ? (totalUp / totalDown).toFixed(1) : 0;
        return {
            date: new Date(t.createdAt),
            ratio: parseFloat(ratio),
            path: t.path,
            type: t.type
        };
    });

    // Determine X-axis range (dates) and Y-axis range (ratios)
    const dates = dataPoints.map(d => d.date);
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    maxDate.setMonth(maxDate.getMonth() + 1);
    maxDate.setDate(5);
    maxDate.setHours(0, 0, 0, 0);
    const maxRatio = Math.max(...dataPoints.map(d => d.ratio), 1); // Ensure min height

    // X-scale: Linear time scale
    const xScale = (date) => {
        const timeRange = maxDate - minDate;
        return ((date - minDate) / timeRange) * innerWidth;
    };

    // Y-scale: Linear ratio scale
    const yScale = (ratio) => innerHeight - (ratio / maxRatio) * innerHeight;

    // Generate month ticks for X-axis
    const monthTicks = [];
    let current = new Date(minDate);
    current.setDate(1);
    while (current <= maxDate) {
        monthTicks.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
    }

    // Draw X-axis (months)
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xAxis.setAttribute('transform', `translate(0,${innerHeight})`);
    monthTicks.forEach(month => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', xScale(month) + 10);
        text.setAttribute('y', 20);
        text.setAttribute('text-anchor', 'middle');
        text.textContent = `${month.getMonth() + 1}/${month.getFullYear().toString().slice(-2)}`;
        xAxis.appendChild(text);

        // Grid line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', xScale(month));
        line.setAttribute('x2', xScale(month));
        line.setAttribute('y1', 0);
        line.setAttribute('y2', innerHeight);
        line.setAttribute('stroke', '#e0e0e0');
        line.setAttribute('stroke-width', '1');
        g.appendChild(line);
    });
    g.appendChild(xAxis);

    // Draw Y-axis (ratios)
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    for (let i = 0; i <= Math.ceil(maxRatio); i += 0.5) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', -10);
        text.setAttribute('y', yScale(i));
        text.setAttribute('text-anchor', 'end');
        text.textContent = i.toFixed(1);
        yAxis.appendChild(text);

        // Grid line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', 0);
        line.setAttribute('x2', innerWidth);
        line.setAttribute('y1', yScale(i));
        line.setAttribute('y2', yScale(i));
        if (i === 0.5) {
            line.setAttribute('stroke', '#FF0000');
            line.setAttribute('stroke-width', '2');
        } else {
            line.setAttribute('stroke', '#e0e0e0');
            line.setAttribute('stroke-width', '1');
        }
        g.appendChild(line);
    }
    g.appendChild(yAxis);

    // Draw line
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const points = dataPoints.map((d, i) => `${xScale(d.date)},${yScale(d.ratio)}`).join(' ');
    path.setAttribute('d', `M ${points}`);
    path.setAttribute('stroke', 'blue');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    g.appendChild(path);



    dataPoints.forEach((d, i) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', xScale(d.date));
        circle.setAttribute('cy', yScale(d.ratio));
        circle.setAttribute('r', 5);
        circle.setAttribute('fill', d.type === 'up' ? 'green' : 'darkred');
        circle.addEventListener('mouseover', throttle(() => {
            const svgWidth = document.getElementById('graph1').getBoundingClientRect().width;
            // Set tooltip text content (last part of path)
            tooltipText.textContent = d.path.split('/').pop();

            // Position tooltip
            const bbox = tooltipText.getBBox();
            var x = xScale(d.date) + bbox.width + 60 < svgWidth ? xScale(d.date) : xScale(d.date) + 10 - bbox.width;

            const y = yScale(d.ratio) - 10;
            tooltipText.setAttribute('x', x + 5); // Padding
            tooltipText.setAttribute('y', y ); // Align text vertically

            // Update background size based on text
            tooltipBg.setAttribute('x', x);
            tooltipBg.setAttribute('y', y - 15); // Account for text height
            tooltipBg.setAttribute('width', bbox.width + 10); // Padding
            tooltipBg.setAttribute('height', bbox.height + 10); // Padding

            tooltipGroup.setAttribute('visibility', 'visible');
        }, 100));

        circle.addEventListener('mouseout', () => {
            tooltipGroup.setAttribute('visibility', 'hidden');
        });
        g.appendChild(circle);
    });

    // Draw points with tooltip
    const tooltipGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    tooltipGroup.setAttribute('id', 'tooltip');
    tooltipGroup.setAttribute('visibility', 'hidden');
    g.appendChild(tooltipGroup);

    // Tooltip background (rect)
    const tooltipBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    tooltipBg.setAttribute('fill', 'rgba(0, 0, 0, 0.7)'); // Semi-transparent black
    tooltipBg.setAttribute('rx', '5'); // Rounded corners
    tooltipGroup.appendChild(tooltipBg);

    // Tooltip text
    const tooltipText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tooltipText.setAttribute('fill', 'white'); // White text for contrast
    tooltipText.setAttribute('font-size', '12');
    tooltipGroup.appendChild(tooltipText);

}

// Example usage:
// drawAuditRatioGraph(graphQLData);