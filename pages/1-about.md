---
title: "Home"
permalink: "/"
layout: homepage
---


<style>
    .flex-container {
        display: flex;
        align-items: flex-start;
    }

    .text-container {
        flex: 3.5;
        /* text-align: left; */
    }

    .photo-text-container {
        flex: 1.5;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        height: 100%;
        padding: 20px; /* New padding */
    }

    .photo-text-container .personal-photo {
        width: 300px;
        /* max-width: 90%; Responsive width */
        height: auto; /* Maintain aspect ratio */
        padding: 10px;
    }

    .photo-text-container .publication-photo {
        width: 100%; /* Fixed width for publication photos */
        height: 200px; /* Fixed height for publication photos */
        /* Ensures images cover the space without distorting aspect ratio */
        object-fit: cover; 
        padding: 5px;
    }

    @media (max-width: 768px) {
        .flex-container {
            flex-direction: column;
            align-items: center;
        }
        .text-container, .photo-text-container {
            flex: none;
            max-width: 100%;
            margin: 0 0 0px;
        }
        .photo-text-container .personal-photo,
        .photo-text-container .publication-photo {
            max-width: 100%; /* Ensures full width on smaller screens */
        }
    }
</style>




<div class="flex-container">
    <div class="photo-text-container">
        <!-- Photo -->
        <img src="https://gunyeal.github.io/assets/gylee_2023.jpeg" alt="Gun-Yeal Lee" class="personal-photo">
    </div>
    <div class="text-container">
        <!-- <h2>Gun-Yeal Lee</h2> -->
        <div style="text-align: left;">
            <p>I am a Postdoctoral Researcher at Stanford University, working with Prof. <a href="https://web.stanford.edu/~gordonwz/">Gordon Wetzstein</a> at the <a href="https://www.computationalimaging.org/">Stanford Computational Imaging Lab</a>. I am broadly interested in Optics and Photonics, with a particular focus on nanophotonics and metasurfaces. My recent research at the intersection of optics and computer vision focuses on developing next-generation optical imaging, display, and computing systems, utilizing advanced photonic devices and AI-driven algorithms.</p>
            <p>I completed my PhD at Seoul National University in 2021 under the guidance of Prof. <a href="https://scholar.google.com/citations?hl=en&user=VExwDP4AAAAJ">Byoungho Lee</a> at the <a href="http://oeqelab.snu.ac.kr/">Optical Engineering and Quantum Electronics Lab</a>. For my undergraduate studies, I double-majored in Electrical and Computer Engineering and Physics, also at Seoul National University.</p>
        </div>
        <!-- <div style="text-align: center; font-size:150%;">
            <a href="mailto:gunyeal@stanford.edu"><i class="fas fa-envelope" style="font-size:24px; margin: 10px;"></i></a>
            <a href="https://scholar.google.com/citations?user=SlXpVNkAAAAJ&hl=en" target="_blank"><i class="fas fa-graduation-cap" style="font-size:24px; margin: 10px;"></i></a>
            <a href="https://www.linkedin.com/in/gun-yeal-lee-4b7b54224/" target="_blank"><i class="fab fa-linkedin" style="font-size:24px; margin: 10px;"></i></a>
        </div> -->
        <div style="text-align: center; font-size:100%;">
            <a href="mailto:gunyeal@stanford.edu">Email</a> / 
            <a href="https://scholar.google.com/citations?user=SlXpVNkAAAAJ&hl=en" target="_blank">Google Scholar</a> /
            <a href="https://www.linkedin.com/in/gun-yeal-lee-4b7b54224/" target="_blank">Linkedin</a>
        </div>
    </div>
</div>

<br>

<!-- ## News
 - News 1
 - News 2
 - **09/2022**: Start my postdoctoral research at Stanford! -->
<!-- 
<br> -->

<h2>Featured Publications</h2>

<div style="text-align: right">
    <a href="https://gunyeal.github.io/publications/">[See All Publications > ]</a>
</div>


<hr style="height:0.3px; margin-top:10px; margin-bottom:0">

<div class="flex-container">
    <div class="photo-text-container">
        <img src="https://gunyeal.github.io/assets/photos/figure-arwaveguide.jpg" alt="figure-ar-waveguide" class="publication-photo">
    </div>
    <div class="text-container">
        <h2>Full-color 3D holographic augmented reality displays with metasurface waveguides</h2>
        <p>Manu Gopakumar*, <u><b>Gun-Yeal Lee*</b></u>, Suyeon Choi, Brian Chao, Yifan Peng, Jonghyun Kim, Gordon Wetzstein (*equal contribution)</p>
        <p><b>Nature 2024</b></p>
        <p></p>
        <p><a href="https://www.nature.com/articles/s41586-024-07386-0">[Link]</a><a href="https://www.computationalimaging.org/publications/holographicar/">[Project Page]</a></p>
    </div>
</div>
<hr style="height:0.3px; margin-top:0; margin-bottom:0">

<div class="flex-container">
    <div class="photo-text-container">
        <img src="https://gunyeal.github.io/assets/photos/figure-metalens-ar.png" alt="figure-metalens-ar" class="publication-photo">
    </div>
    <div class="text-container">
        <h2>Metasurface eyepiece for augmented reality</h2>
        <p><u><b>Gun-Yeal Lee*</b></u>, Jong-Young Hong*, SoonHyoung Hwang, Seokil Moon, Hyeokjung Kang, Sohee Jeon, Hwi Kim, Jun-Ho Jeong, Byoungho Lee (*equal contribution)</p>
        <p><b>Nature Communications 2018</b></p>
        <!-- <p>Large-area metalens for wide viewing augmented reality</p> -->
        <p><a href="https://www.nature.com/articles/s41467-018-07011-5">[Link]</a> <b>[Citations: 460]</b></p>
    </div>
</div>
<hr style="height:0.3px; margin-top:0; margin-bottom:0">

<div class="flex-container">
    <div class="photo-text-container">
        <!-- Photo -->
        <img src="https://gunyeal.github.io/assets/photos/figure-complexhologram.png" alt="figure-complexhologram" class="publication-photo">
    </div>
    <div class="text-container">
        <!-- <h2>Gun-Yeal Lee</h2> -->
        <h2>Complete amplitude and phase control of light using broadband holographic metasurfaces</h2>
        <p><u><b>Gun-Yeal Lee</b></u>, Gwanho Yoon, Seung-Yeol Lee, Hansik Yun, Jaebum Cho, Kyookeun Lee, Hwi Kim, Junsuk Rho, Byoungho Lee</p>
        <p><b>Nanoscale 2018</b></p>
        <p><a href="https://www.nature.com/articles/s41467-018-07011-5">[Link]</a> <b>[Citations: 393]</b></p>
    </div>
</div>
<hr style="height:0.3px; margin-top:0; margin-bottom:0">

