# Linux Manual Installation Guide
#### (Last Performed When Using Ubuntu v14.x)

## Overview:

1. [About *Lexos*](#about)
2. [Installing Python and Anaconda](#installing-anaconda)
3. [Installing Additional Packages](#installing-packages)
4. [Downloading and Extracting _Lexos_](#downloading-lexos)
5. [Starting and Launching _Lexos_](#starting-lexos)
6. [Quitting Lexos](#quitting-lexos)

### <a name='about-lexos'></a> About _Lexos_
_Lexos_ is an integrated workflow of tools to facilitate computational text analysis, presented in a web-based interface. Lexos is written primarily in Python 2.7.11 using the [*Flask*](http://flask.pocoo.org/) microframework, based on Werkzeug and Jinja 2. A heavy dose of Javascript and CSS is included on the front-end. We increasingly incorporate the wiz from [*D3.js*](http://d3js.org/) in our visualizations and the power in the [*scikit-learn*](http://scikit-learn.org/stable/) modules for text and statistical processing.

### <a name='installing-anaconda'></a>Installing Python and Anaconda
If you do not already have Python v2.7 installed on your computer, we recommend installing it through the free Anaconda distribution.[[1](#n1)] If you already have Python, Anaconda will run alongside your current installation.

1. Visit the Anaconda downloads page on the web: [http://continuum.io/downloads](http://continuum.io/downloads). Locate the **Jump to:** on the screen; click on the **Linux** link.
2. Download the **Linux 64-bit Graphical Installer** by clicking on the blue button.
3. Double-click the installer application icon (it will be called something like `Anaconda2-4.1.1-Linux-x86_64.sh`) and follow the instructions on the screen.
4. After locating the install script (e.g., in `Downloads/`, run the (bash) shell installer:

```
bash Anaconda-4.0.0-Linux-x86_64.sh
```

> *Note: A newer version of Anaconda may have a new version number; check your exact filename.*

Follow the instructions on the screen, and, when the process is complete, select **Finish** to finish the installation of Anaconda.

You should now verify that we have installed it correctly. To do this, follow the instructions below:

1. Open a terminal window. This is important to ensure that your `$PATH` includes Anaconda.
2. Type `python -V` and hit the `Enter` key.

You should see a response that looks like: `Python 2.7.12 :: Anaconda 4.1.1 (64-bit)`. If you do not 
see `:: Anaconda 4.1.1` then you did open a new terminal window or you did not update your PATH 
variable during the Anaconda installation. We recommend that you uninstall Anaconda and try to install it again, following the 
instructions above. To uninstall Anaconda, type `rm -rf ~/anaconda2`, replacing `anaconda2` with the 
name of the Anaconda directory, if it is different. Hit the `Enter` key. 

### <a name='installing-packages'></a> Installing Additional Python Packages
You must now install three additional Python packages needed to run _Lexos_.
1. Begin my making sure that your package installer (pip) is up to date. Type `pip install -U pip` and hit the `Enter` key. Your terminal window will display some information showing you the update process. Once that is completed, you can now use 'pip' (python package installer) in the next step.
2. Type the following three commands, hitting the `Enter` key after each one. The installation process for each may take some time.
```python
pip install gensim
pip install chardet
pip install natsort
```
When the last installation is finished, you are ready to download _Lexos_.

### <a name='downloading-lexos'></a> Downloading and Extracting _Lexos_
To download _Lexos_, enter [https://github.com/WheatonCS/Lexos/archive/master.zip](https://github.com/WheatonCS/Lexos/archive/master.zip) in your browser's address bar. Alternatively, go to the _Lexos_ GitHub page: [https://github.com/WheatonCS/Lexos](https://github.com/WheatonCS/Lexos). Click the green **Clone or download** button on the right side of the screen; then click the **Download Zip** button. 

Once the _Lexos_ zip archive has downloaded, right-click on the zip icon, and select **Open With > Archive Utility**. Choose where you would like to install _Lexos_. If you wish, you may change the name of the extracted folder from `Lexos-master` to `Lexos`. In the instructions below, we will assume that you did this and that you extracted the `Lexos` folder to the Desktop.

### <a name='starting-lexos'></a> Starting and Launching _Lexos_
**Important: Close your current terminal window and open a new one.**

In most cases, the terminal window will open in your computer's user account directory. It will show your location by displaying something like `/users/YOUR_NAME`. If the command prompt says something else, you may need to navigate to this folder.

Now navigate to the `Lexos` folder by typing `cd Desktop/Lexos` and hit the `Enter` key. If you encounter an error, make sure that you are starting in your user account folder, that the Lexos folder is on the Desktop, and that it is called `Lexos`. The terminal should now display something liken `/users/YOUR_NAME/Desktop`.

Type `python lexos.py` and hit the `Enter` key. This will start _Lexos_. It may take a minute to see a response the first time you run the command because Python has to reconfigure some of the project files for your computer. But shortly after you should see the following:
```
Restarting with stat
Debugger is active!
Debugger pin code: 236-087-009
Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```
**Important:** Keep the `python lexos.py` command running while you use _Lexos_. You may minimize the terminal window, but do not close it.

Once you see the message above, you are ready to launch _Lexos_. Go to a web browser and enter [`localhost:5000`](localhost:5000) in the address bar. We recommend using either Firefox or Chrome (other browsers are not supported and may not work with _Lexos_). You will soon see the _Lexos_ upload page. For information about using _Lexos_, click the "Gear" icon at the top right of the screen.

**Note:** Because your computer is acting as both the web server and the user of _Lexos_, you may need to hit the **Reset** button in the top right corner of the **Upload** page to make sure files from any previous sessions are purged.

### <a name='quitting-lexos'></a> Quitting _Lexos_
To quit _Lexos_ simply close your browser window and close the terminal window running `python lexos.py`.

_Last edited: August 20, 2016_

<a name='n1'></a>[1] [Anaconda](https://docs.continuum.io/anaconda/) is a free distribution of the Python programming language for large-scale data processing, predictive analytics, and scientific computing, that aims to simplify package management and deployment. As of June 2016, Anaconda includes 820+ of the most popular Python packages, including most of the packages needed for _Lexos_.