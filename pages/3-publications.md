---
title: "Publications"
permalink: /publications/
layout: page
---

<style>
.article {
    border-bottom: 0.3px solid #ccc; /* Adds a light grey line below each article */
    padding-bottom: 15px; /* Adds some padding below each article */
    margin-bottom: 20px; /* Adds some space below each article, including the line */
}

.article h4 {
    margin-top: 0; /* Removes the top margin from the article title if necessary */
    margin-bottom: 5px;
}

.article p {
    margin-top: 0;
    margin-bottom: 5px; /* Reduces the space between paragraphs within an article */
}
</style>

> For full list of publications, see my [Google Scholar profile](https://scholar.google.com/citations?user=SlXpVNkAAAAJ&hl=en)  

<div style="text-align: right">
&dagger;: These authors contributed equally
</div>

<br>

{% assign count = site.data.publications | size %}
{% for publication in site.data.publications %}
<div class="article">
    <!-- <h4>{{ count }}. {{ publication.title }}</h4> -->
    <h4>{{ publication.title }}</h4>
    <p>
        {% assign normalizedName = publication.authors | replace: "Gun-Yeal Lee", "<u><b>Gun-Yeal Lee</b></u>" %}
        {% assign boldedNameWithDagger = normalizedName | replace: "<strong>Gun-Yeal Lee</strong>&dagger;", "<u><strong>Gun-Yeal Lee&dagger;</strong></u>" %}
        {{ boldedNameWithDagger }}
    </p>
    <p><em>{{ publication.journal }}</em> {%if publication.volume %}{{ publication.volume }}{% endif %}{% if publication.issue %}({{ publication.issue }}){% endif %}{%if publication.article %}, article {{ publication.article }}{% endif %} ({{ publication.year }}). <a href="{{ publication.link }}">[Link]</a>{% if publication.notes %} {{ publication.notes }}{% endif %}</p>
</div>
{% assign count = count | minus: 1 %}
{% endfor %}





<!-- <style>
:root {
    --color-title: #8c1515;
}
.colorTitle {
    color: var(--color-title);
}
</style> -->

<!-- {% assign count = site.data.publications | size %}
{% for publication in site.data.publications %}
{{ count }}. {{ publication.title }}
{{ publication.authors }}
***{{ publication.journal }}*** {{ publication.volume }}({{ publication.issue }}), article {{ publication.article }} ({{ publication.year }}). [Link]({{ publication.link }}){% if publication.notes %} **{{ publication.notes }}**{% endif %}
{% assign count = count | minus: 1 %}
{% endfor %} -->