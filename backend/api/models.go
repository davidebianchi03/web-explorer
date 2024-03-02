package api

type Child struct {
	Name              string `json:"name"`
	Absolute_path     string `json:"absolute_path"`
	Parent            string `json:"parent"`
	Is_directory      bool   `json:"is_directory"`
	Permissions       string `json:"permissions"`
	Size              int64  `json:"size"`
	Modification_time string `json:"modification_time"`
}
