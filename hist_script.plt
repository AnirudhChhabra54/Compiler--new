set terminal png
set output 'histogram.png'
set title 'Histogram: Age'
set style data histogram
set style fill solid
binwidth = -1
bin(x,width)=width*floor(x/width)
plot 'hist_data.txt' using (bin($1,binwidth)):(1.0) smooth freq with boxes title 'Age'
