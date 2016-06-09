start "WF App" cmd /c "C:\Program Files\MongoDB\Server\3.2\bin\"mongod --storageEngine=mmapv1 --dbpath "C:\Users\gcolin\yeodb"
REM mongod --storageEngine=mmapv1 --dbpath C:\Users\gcolin\yeodb
cd "C:\Users\gcolin\yeorest\"
node index.js
