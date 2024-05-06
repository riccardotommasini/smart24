import pandas as pd
import pycountry
import plotly.express as px
import plotly
import plotly.express as px
import numpy as np

df_glacier = pd.read_csv('../DOI-WGMS-FoG-2024-01/data/glacier.csv')
df_glacier_id_lut = pd.read_csv('../DOI-WGMS-FoG-2024-01/data/glacier_id_lut.csv')
df_state = pd.read_csv('../DOI-WGMS-FoG-2024-01/data/state.csv')
df_state.shape

df_glacier_selected = df_glacier[['NAME', 'WGMS_ID', 'LATITUDE', 'LONGITUDE', 'GLACIER_REGION_CODE', 'POLITICAL_UNIT', 'GEN_LOCATION']]
df_state_selected = df_state[['WGMS_ID', 'AREA']]

merged_df = pd.merge(df_glacier_selected, df_state_selected, on='WGMS_ID', how='left')

merged_df.dropna(inplace=True)

def get_country_name(name):
    try:
        return pycountry.countries.lookup(name).common_name
    except:
        return None

def get_country_alpha3(name):
    try:
        return pycountry.countries.lookup(name).alpha_3
    except:
        return None
    
merged_df['COUNTRY'] = merged_df['POLITICAL_UNIT'].apply(get_country_name)
merged_df['POLITICAL_UNIT'] = merged_df['POLITICAL_UNIT'].apply(get_country_alpha3)
merged_df['LOG_AREA'] = np.log(merged_df['AREA'])

import plotly.express as px
import dash
from dash import dcc, html
from dash.dependencies import Input, Output

# Création de la carte avec Plotly Express
fig = px.scatter_geo(
    merged_df, 
    lat='LATITUDE', 
    lon='LONGITUDE',
    hover_name='NAME', 
    color='LOG_AREA', 
    projection='orthographic', 
    hover_data={'LATITUDE': False, 'LONGITUDE': False, 'LOG_AREA': False, 'COUNTRY' : True, 'AREA' : True}, 
    color_continuous_scale='RdBu_r', 
    title='Surface des glaciers dans le monde'
)

# Création de l'application Dash
app = dash.Dash("carte_reacherche_glacier")

# Liste des pays uniques dans votre dataframe
liste_pays = merged_df['COUNTRY'].unique()

# Création de la liste déroulante pour le pays
country_dropdown = dcc.Dropdown(
    id='country-dropdown',
    options=[{'label': pays, 'value': pays} for pays in liste_pays],
    placeholder='Sélectionner un pays'
)

# Mise en page de l'application
app.layout = html.Div([
    dcc.Input(id='search-input', type='text', placeholder='Rechercher un glacier par nom'),
    country_dropdown,
    html.Div(id='output-container')
])

# Callback pour mettre à jour la carte en fonction de la recherche
@app.callback(
    Output('output-container', 'children'),
    [Input('search-input', 'value'),
     Input('country-dropdown', 'value')]
)
def update_map(search_value, country_value):
    if search_value or country_value:
        filtered_data = merged_df
        if search_value:
            filtered_data = filtered_data[filtered_data['NAME'].str.contains(search_value, case=False)]
        if country_value:
            filtered_data = filtered_data[filtered_data['COUNTRY'] == country_value]
        if not filtered_data.empty:
            updated_fig = px.scatter_geo(
                filtered_data, 
                lat='LATITUDE', 
                lon='LONGITUDE',
                hover_name='NAME', 
                color='LOG_AREA', 
                projection='orthographic', 
                hover_data={'LATITUDE': False, 'LONGITUDE': False, 'LOG_AREA': False, 'COUNTRY' : True, 'AREA' : True}, 
                color_continuous_scale='RdBu_r', 
                title='Surface des glaciers dans le monde'
            )
            updated_fig.update_traces(marker=dict(color='green'))
            return dcc.Graph(figure=updated_fig)
        else:
            return "Aucun résultat trouvé pour cette recherche."
    else:
        return dcc.Graph(figure=fig)

# Exécution de l'application
if __name__ == '__main__':
    app.run_server(debug=True)

