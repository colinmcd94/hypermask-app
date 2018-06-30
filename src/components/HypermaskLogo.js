import React from "react";

class HypermaskLogo extends React.Component {
  constructor() {
    super();

    let orig_points = [
      [343, 114],
      [441, 99],
      [501, 129],
      [503, 189],
      [471, 244],
      [423, 244],
      [368, 230],
      [332, 169],
      [386, 177],
      [441, 189],
      [434, 134]
    ];

    let params = [];
    for (let i = 0; i < orig_points.length; i++) {
      params.push([
        5 + 5 * Math.random(),
        1 * Math.random(),
        3 * Math.random()
      ]);
    }

    this.state = {
      orig_points: orig_points,
      params: params,
      start: Date.now()
    };
  }
  componentDidMount() {
    const renderLoop = () => {
      if (window.scrollY < 300) {
        this.setState({});
      }
      this.rAF = requestAnimationFrame(renderLoop);
    };
    this.setState({ start: Date.now() });
    renderLoop();
  }
  componentWillUnmount() {
    cancelAnimationFrame(this.rAF);
  }
  render() {
    let { orig_points, params, start } = this.state;

    let points = [];
    let t = Date.now() / 700 * (this.props.speed || 1);
    for (let i = 0; i < orig_points.length; i++) {
      let d = params[i];
      points.push([
        orig_points[i][0] + d[0] * Math.sin(t * d[1] + d[2]) - 300,
        orig_points[i][1] + d[0] * Math.sin(t * d[1] + d[2]) - 80
      ]);
    }

    let lines = [
      [0, 7],
      [0, 8],
      [8, 5],
      [8, 6],
      [5, 9],
      [9, 3],
      [9, 4],
      [1, 10],
      [10, 3],
      [10, 2],
      [10, 8]
    ];
    for (let i = 0; i < points.length; i++) {
      lines.push([i, (i + 1) % points.length]);
    }

    function formatTime(seconds) {
      if (seconds < 60) {
        return seconds;
      } else if (seconds < 60 * 60) {
        return Math.floor(seconds / 60) + ":" + ("00" + seconds % 60).slice(-2);
      } else {
        return (
          Math.floor(seconds / 60 / 60) +
          ":" +
          ("00" + Math.floor((seconds / 60) % 60)).slice(-2) +
          ":" +
          ("00" + seconds % 60).slice(-2)
        );
      }
    }
    return (
      <svg
        className="hypermask-logo"
        width="80"
        height="80"
        viewBox="0 0 250 200"
        {...this.props}
      >
        {lines.map((k, i) => (
          <line
            key={i}
            x1={points[k[0]][0]}
            y1={points[k[0]][1]}
            x2={points[k[1]][0]}
            y2={points[k[1]][1]}
          />
        ))}
        {points.map((k, i) => <circle cx={k[0]} cy={k[1]} key={i} />)}
        {this.props.clock ? (
          <text x="125" y="100">
            {formatTime(Math.round((Date.now() - start) / 1000) + 1)}
          </text>
        ) : null}
      </svg>
    );
  }
}

export default HypermaskLogo;
