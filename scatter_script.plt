set terminal png
set output 'scatter_plot.png'
set title 'Scatter Plot: Age vs Salary'
set xlabel "Age"
set ylabel "Salary"
plot 'scatter_data.txt' using 1:2 with points title 'Data Points'
